Para rodar o projeto

## Desenvolvimento

Para criar a imagem

```
docker build -t dgs-technology-radar:latest .
```

```
docker run --init -p 5173:5173 dgs-technology-radar:dev
```

Rodar a imagem em desenvolvimento

docker run -p 5173:5173 dgs-technology-radar:dev

## Produção

Rodar a imagem em produção

docker run --rm -p 5173:5173 dgs-technology-radar:latest
