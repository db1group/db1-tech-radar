import pt from '../../assets/pt.png';
import en from '../../assets/en.png';
import es from '../../assets/es.png';
import i18n from '../../i18n';
import { Language } from "../../model";

import "./buttonFlag.scss";

const languageOptions = [
    {
      name: "Português",
      value: Language.pt,
      flag: pt
    },
    {
      name: "English",
      value: Language.en,
      flag: en
    },
    {
      name: "Espanol",
      value: Language.es,
      flag: es
    },
]

function ButtonFlag() {
  return (
    <div>
      {languageOptions.map(languageOption => (
        <img 
          className='buttonFlag'
          src={languageOption.flag}
          alt={languageOption.name}
          onClick={() => {
            i18n.changeLanguage(languageOption.value);
          }}>          
        </img>
      ))}
    </div>
  );
}

export default ButtonFlag;