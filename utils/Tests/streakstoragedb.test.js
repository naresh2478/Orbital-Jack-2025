
import { getTasks, addTask, deleteTask, toggleTaskCompletion } from '../streakstoragedb';
import { getDocs, setDoc, deleteDoc, updateDoc, doc, collection } from 'firebase/firestore';
import { format } from 'date-fns';

// ✅ Define mockDb and testUid clearly
const mockDb = {};
const testUid = 'testuid';

// ✅ Mock Firestore and Firebase Auth
jest.mock('firebase/firestore', () => ({
    getDocs: jest.fn(),
    setDoc: jest.fn(),
    deleteDoc: jest.fn(),
    updateDoc: jest.fn(),
    doc: jest.fn(),
    collection: jest.fn(),
    query: jest.fn(),
    orderBy: jest.fn(),
}));

jest.mock('../firebase', () => ({
    auth: { currentUser: { uid: 'testuid' } },
    db: {},
}));

describe('streakstoragedb utilities', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // ✅ Test getTasks
    it('getTasks: should call getDocs with correct collection and return mapped tasks', async () => {
        const mockDocs = [{ id: '1', data: () => ({ name: 'Task 1' }) }];
        getDocs.mockResolvedValueOnce({ docs: mockDocs });

        collection.mockReturnValue('mockCollectionRef');

        const tasks = await getTasks();

        expect(collection).toHaveBeenCalledWith(mockDb, 'users', testUid, 'habits');
        expect(tasks).toEqual([{ id: '1', name: 'Task 1' }]);
    });

    // ✅ Test addTask
    it('addTask: should add a new task if it does not exist', async () => {
        getDocs.mockResolvedValueOnce({ docs: [] }); // Simulate no tasks
        collection.mockReturnValue('mockCollectionRef');
        doc.mockReturnValue('mockDocRef');

        await addTask('New Task');

        expect(doc).toHaveBeenCalled();
        expect(setDoc).toHaveoneenCalled();
    });

    // ✅ Test deleteTask
    it('deleteTask: should delete the task if it exists', async () => {
        getDocs.mockResolvedValueOnce({
            docs: [{ id: '1', data: () => ({ name: 'Task to Delete' }) }],
        });
        collection.mockReturnValue('mockCollectionRef');
        doc.mockReturnValue('mockDocRef');

        await deleteTask('Task to Delete');

        expect(doc).toHaveBeenCalledWith(mockDb, 'users', testUid, 'habits', '1');
        expect(deleteDoc).toHaveBeenCalledWith('mockDocRef');
    });

    // ✅ Test toggleTaskCompletion
    it('toggleTaskCompletion: should update streak and lastCompleted correctly', async () => {
        const today = format(new Date(), 'yyyy-MM-dd');

        getDocs.mockResolvedValueOnce({
            docs: [
                {
                    id: '1',
                    data: () => ({
                        name: 'Toggle Task',
                        lastCompleted: null,
                        streak: 0,
                        createdAt: new Date(),
                    }),
                },
            ],
        });

        collection.mockReturnValue('mockCollectionRef');
        doc.mockReturnValue('mockDocRef');

        await toggleTaskCompletion('Toggle Task');

        expect(updateDoc).toHaveBeenCalledWith('mockDocRef', {
            lastCompleted: today,
            streak: 1,
        });
    });
});
