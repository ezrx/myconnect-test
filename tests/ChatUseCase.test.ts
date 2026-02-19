import { ChatUseCase } from '../src/application/use-cases/ChatUseCase';
import { ISessionRepository } from '../src/domain/repositories/ISessionRepository';
import { IAIService } from '../src/domain/services/IAIService';
import { Session } from '../src/domain/entities/Session';

describe('ChatUseCase', () => {
  let mockRepo: jest.Mocked<ISessionRepository>;
  let mockAIService: jest.Mocked<IAIService>;
  let chatUseCase: ChatUseCase;

  beforeEach(() => {
    mockRepo = {
      getAll: jest.fn(),
      getById: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    };
    mockAIService = {
      generateResponse: jest.fn(),
    };
    chatUseCase = new ChatUseCase(mockRepo, mockAIService);
  });

  it('should create a new session', async () => {
    const title = 'Test Session';
    const session = await chatUseCase.createSession(title);

    expect(session.title).toBe(title);
    expect(session.id).toBeDefined();
    expect(mockRepo.save).toHaveBeenCalledWith(session);
  });

  it('should send a message and get an AI response', async () => {
    const sessionId = '123';
    const initialSession: Session = {
      id: sessionId,
      title: 'Test',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockRepo.getById.mockResolvedValue(initialSession);
    mockAIService.generateResponse.mockResolvedValue('AI Response');

    const message = await chatUseCase.sendMessage(sessionId, 'Hello');

    expect(message.content).toBe('AI Response');
    expect(mockRepo.save).toHaveBeenCalledTimes(2); // Once for user message, once for AI message
    expect(initialSession.messages.length).toBe(2);
  });
});
