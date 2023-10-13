module.exports = (asyncFunction) => {
  // Retorna um middleware que dispara uma função assíncrona
  return (request, response, next) => {
    asyncFunction(request, response, next).catch((error) => next(error));
  };
};
