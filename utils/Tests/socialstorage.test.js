import {
  initializeSocialFields,
  searchUserByEmail,
  followUser,
  unfollowUser,
  setPrivacy,
  approveFollower,
  getFollowers,
  getFollowing,
  getPendingFollowers,
  getUserProfile,
  removeFollower
} from '../socialstorage';

import {
  getDocs,
  getDoc,
  updateDoc,
  doc,
  collection,
  query,
  where,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';

jest.mock('firebase/firestore', () => ({
  getDocs: jest.fn(),
  getDoc: jest.fn(),
  updateDoc: jest.fn(),
  doc: jest.fn(),
  collection: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  arrayUnion: jest.fn(val => [val]),
  arrayRemove: jest.fn(val => [val])
}));

jest.mock('../firebase', () => ({
  auth: { currentUser: { uid: 'mockUserId' } },
  db: 'mockDb'
}));

describe('socialstorage backend functions', () => {
  beforeEach(() => jest.clearAllMocks());

  it('initializeSocialFields should update user doc', async () => {
    doc.mockReturnValue('mockDocRef');
    await initializeSocialFields('user123');
    expect(updateDoc).toHaveBeenCalledWith('mockDocRef', {
      privacy: 'public',
      pendingFollowers: [],
      followers: [],
      following: []
    });
  });

  it('searchUserByEmail returns user data if found', async () => {
    const mockDocs = [{ id: 'uid123', data: () => ({ email: 'a@b.com' }) }];
    getDocs.mockResolvedValueOnce({ empty: false, docs: mockDocs });
    const user = await searchUserByEmail('a@b.com');
    expect(user).toEqual({ uid: 'uid123', email: 'a@b.com' });
  });

  it('setPrivacy should set public or private', async () => {
    doc.mockReturnValue('mockDocRef');
    await setPrivacy(true);
    expect(updateDoc).toHaveBeenCalledWith('mockDocRef', { privacy: 'private' });
  });

  it('approveFollower should move user from pending to followers', async () => {
    doc.mockReturnValueOnce('mockUserRef').mockReturnValueOnce('mockFollowerRef');
    getDoc.mockResolvedValueOnce({
      exists: () => true,
      data: () => ({ pendingFollowers: ['follower123'] })
    });

    await approveFollower('follower123');
    expect(updateDoc).toHaveBeenCalledTimes(2);
  });

  it('getFollowers returns profile list', async () => {
    getDoc
      .mockResolvedValueOnce({
        exists: () => true,
        data: () => ({ followers: ['user1'] })
      })
      .mockResolvedValueOnce({
        exists: () => true,
        data: () => ({ email: 'email1@example.com' })
      });

    const result = await getFollowers('uid');
    expect(result).toEqual([{ uid: 'user1', email: 'email1@example.com' }]);
  });

  it('getFollowing returns profile list', async () => {
    getDoc
      .mockResolvedValueOnce({
        exists: () => true,
        data: () => ({ following: ['user2'] })
      })
      .mockResolvedValueOnce({
        exists: () => true,
        data: () => ({ email: 'email2@example.com' })
      });

    const result = await getFollowing('uid');
    expect(result).toEqual([{ uid: 'user2', email: 'email2@example.com' }]);
  });

  it('getPendingFollowers returns profile list', async () => {
    getDoc
      .mockResolvedValueOnce({
        exists: () => true,
        data: () => ({ pendingFollowers: ['user3'] })
      })
      .mockResolvedValueOnce({
        exists: () => true,
        data: () => ({ email: 'email3@example.com' })
      });

    const result = await getPendingFollowers('uid');
    expect(result).toEqual([{ uid: 'user3', email: 'email3@example.com' }]);
  });

  it('getUserProfile returns full profile', async () => {
    getDoc.mockResolvedValueOnce({
      exists: () => true,
      id: 'user4',
      data: () => ({ email: 'email4@example.com' })
    });

    const result = await getUserProfile('user4');
    expect(result).toEqual({ uid: 'user4', email: 'email4@example.com' });
  });

  it('removeFollower updates both user and follower', async () => {
    doc
      .mockReturnValueOnce('mockUserRef')
      .mockReturnValueOnce('mockFollowerRef');

    await removeFollower('follower123');
    expect(updateDoc).toHaveBeenCalledTimes(2);
  });
});

it('followUser should send follow request to private user', async () => {
  doc
    .mockReturnValueOnce('mockTargetRef')  // targetUserRef
    .mockReturnValueOnce('mockCurrentRef'); // currentUserRef

  getDoc.mockResolvedValueOnce({
    exists: () => true,
    data: () => ({ privacy: 'private' })  // simulate private account
  });

  await followUser('target123');

  expect(updateDoc).toHaveBeenCalledWith('mockTargetRef', {
    pendingFollowers: ['mockUserId']
  });
});

it('followUser should directly follow public user', async () => {
  doc
    .mockReturnValueOnce('mockTargetRef')   // targetUserRef
    .mockReturnValueOnce('mockCurrentRef'); // currentUserRef

  getDoc.mockResolvedValueOnce({
    exists: () => true,
    data: () => ({ privacy: 'public' })  // simulate public account
  });

  await followUser('target123');

  expect(updateDoc).toHaveBeenCalledWith('mockTargetRef', {
    followers: ['mockUserId']
  });

  expect(updateDoc).toHaveBeenCalledWith('mockCurrentRef', {
    following: ['target123']
  });
});

it('unfollowUser should remove follower and following (including pending)', async () => {
  doc
    .mockReturnValueOnce('mockCurrentRef')  // currentUserRef
    .mockReturnValueOnce('mockTargetRef');  // targetUserRef

  await unfollowUser('target123');

  expect(updateDoc).toHaveBeenCalledWith('mockCurrentRef', {
    following: ['target123']
  });

  expect(updateDoc).toHaveBeenCalledWith('mockTargetRef', {
    followers: ['mockUserId'],
    pendingFollowers: ['mockUserId']
  });
});


