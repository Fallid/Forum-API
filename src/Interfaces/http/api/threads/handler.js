const AddThreadUseCase = require('../../../../Applications/use_case/AddThreadUseCase');
const GetThreadByIdUseCase = require('../../../../Applications/use_case/GetThreadByIdUseCase');

class ThreadsHandler {
  constructor(container) {
    this._container = container;

    this.postThreadHandler = this.postThreadHandler.bind(this);
    this.getThreadByIdHandler = this.getThreadByIdHandler.bind(this);
  }

  async postThreadHandler(request, h) {
    const addThreadUseCase = this._container.getInstance(AddThreadUseCase.name);
    const headerAuthorization = request.headers.authorization;
    const addedThread = await addThreadUseCase.execute(request.payload, headerAuthorization);
    const response = h.response({
      status: 'success',
      data: {
        addedThread,
      },
    });
    response.code(201);
    return response;
  }

  async getThreadByIdHandler(request, h) {
    const getThreadById = this._container.getInstance(GetThreadByIdUseCase.name);
    const useCaseParam = request.params;
    const detailedThread = await getThreadById.execute(useCaseParam);

    const response = h.response({
      status: 'success',
      data: {
        thread: detailedThread,
      },
    });
    response.code(200);
    return response;
  }
}

module.exports = ThreadsHandler;
