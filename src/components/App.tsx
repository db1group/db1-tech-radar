import classNames from "classnames";
import React from "react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useParams,
} from "react-router-dom";

import { ConfigData, publicUrl } from "../config";
import { Messages, MessagesProvider } from "../context/MessagesContext";
import { useSearchParamState } from "../hooks/use-search-param-state";
import i18n from "../i18n";
import { Item, filteredOnly, getTags } from "../model";
import { validateConfig } from "../validateConfig";
import ErrorScreen from "./ErrorScreen/ErrorScreen";
import Footer from "./Footer/Footer";
import Header from "./Header/Header";
import Router from "./Router";

interface FetchState<D> {
  data?: D;
  error?: boolean;
}

const useFetch = <D extends unknown>(url: string): FetchState<D> => {
  const [state, setState] = React.useState<FetchState<D>>({});

  React.useEffect(() => {
    let active = true;

    fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            `Request to ${url} failed with status ${response.status}`
          );
        }
        return response.json();
      })
      .then((data: D) => {
        if (active) {
          setState({ data });
        }
      })
      .catch((error) => {
        console.error(`fetch ${url} failed. Did the file exist?`, error);
        if (active) {
          setState({ error: true });
        }
      });

    return () => {
      active = false;
    };
  }, [url]);

  return state;
};

const usePage = (params: Record<string, string | undefined>) => {
  return (params["*"] || "").replace(".html", "");
};

const useFilteredItems = ({ items }: { items: Item[] }) => {
  const [searchParamState] = useSearchParamState();
  const { tags } = searchParamState;

  return tags ? filteredOnly(items, tags) : items;
};

const RouterWithPageParam = ({
  items,
  releases,
  config,
}: {
  items: Item[];
  releases: string[];
  config: ConfigData;
}) => {
  const page = usePage(useParams());
  const [searchParamState] = useSearchParamState();
  const { search } = searchParamState;
  const filteredItems = useFilteredItems({ items });

  return (
    <Router
      pageName={page || ""}
      search={search || ""}
      items={filteredItems}
      releases={releases}
      config={config}
    />
  );
};

const HeaderWithPageParam = ({ items }: { items: Item[] }) => {
  const page = usePage(useParams());
  const tags = getTags(items);

  return <Header pageName={page || ""} tags={tags} />;
};

const FooterWithPageParam = ({ items }: { items: Item[] }) => {
  const page = usePage(useParams());
  const filteredItems = useFilteredItems({ items });

  return <Footer pageName={page || ""} items={filteredItems} />;
};

interface Data {
  items: Item[];
  releases: string[];
}

export default function App() {
  const data = useFetch<Data>(
    `${publicUrl}db1-opinion.json?${process.env.REACT_APP_BUILDHASH}`
  );
  const messages = useFetch<Messages>(
    `${publicUrl}messages.json?${process.env.REACT_APP_BUILDHASH}`
  );
  const config = useFetch<ConfigData>(
    `${publicUrl}config.json?${process.env.REACT_APP_BUILDHASH}`
  );

  const failedFile = data.error
    ? "db1-opinion.json"
    : config.error
    ? "config.json"
    : messages.error
    ? "messages.json"
    : undefined;

  if (failedFile) {
    return (
      <ErrorScreen
        title="Could not load the radar"
        description={`The file ${failedFile} could not be downloaded or parsed. Check that public/${failedFile} exists and is valid JSON.`}
      />
    );
  }

  if (data.data && config.data) {
    const problems = validateConfig(config.data, (key, lng) =>
      i18n.exists(key, { lng })
    );

    if (problems.length > 0) {
      problems.forEach((problem) => console.error(problem));
      return (
        <ErrorScreen
          title="Invalid radar configuration"
          description="Fix the problems below in public/config.json and reload."
          problems={problems}
        />
      );
    }

    const { items, releases } = data.data;
    return (
      <MessagesProvider messages={messages.data}>
        <BrowserRouter basename={`${publicUrl}`}>
          <Routes>
            <Route
              path={"/*"}
              element={
                <div>
                  <div className="page">
                    <div className="page__header">
                      <HeaderWithPageParam items={items} />
                    </div>
                    <div className={classNames("page__content")}>
                      <RouterWithPageParam
                        config={config.data}
                        items={items}
                        releases={releases}
                      />
                    </div>
                    <div className="page__footer">
                      <FooterWithPageParam items={items} />
                    </div>
                  </div>
                </div>
              }
            />
            <Route
              path={"/"}
              element={<Navigate replace to={"/index.html"} />}
            />
          </Routes>
        </BrowserRouter>
      </MessagesProvider>
    );
  }

  return null;
}
