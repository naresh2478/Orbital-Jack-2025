import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, Image,
    ScrollView, TextInput, Modal, FlatList, SafeAreaView, KeyboardAvoidingView, Platform
} from 'react-native';
import { auth, db } from '../utils/firebase';
import { doc, getDoc, updateDoc, arrayRemove } from 'firebase/firestore';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import {
    getFollowers, getFollowing, getPendingFollowers,
    searchUserByEmail, followUser, unfollowUser,
    approveFollower, getUserProfile, removeFollower
} from '../utils/socialstorage';

import emailIcon from '../assets/email.png';
import elevationIcon from '../assets/elevationicon.png';
import conqueredIcon from '../assets/conquer.png';
import currentMountainIcon from '../assets/MountainIcon.png';

const router = useRouter();

const UserProfile = () => {
    const [email, setEmail] = useState('');
    const [totalElevation, setTotalElevation] = useState(0);
    const [conqueredMountains, setConqueredMountains] = useState([]);
    const [currentMountain, setCurrentMountain] = useState('None');

    const [followers, setFollowers] = useState([]);
    const [following, setFollowing] = useState([]);
    const [pendingFollowers, setPendingFollowers] = useState([]);

    const [modalVisible, setModalVisible] = useState(false);
    const [modalType, setModalType] = useState('');
    const [searchEmail, setSearchEmail] = useState('');
    const [searchResult, setSearchResult] = useState(null);
    const [selectedProfile, setSelectedProfile] = useState(null);
    const [isFollowing, setIsFollowing] = useState(false);
    const [hasRequested, setHasRequested] = useState(false);


    useFocusEffect(
        React.useCallback(() => {
            fetchUserData();
        }, [])
    );

    const fetchUserData = async () => {
        const uid = auth.currentUser?.uid;
        const currentEmail = auth.currentUser?.email;
        if (!uid) return;

        const userDocRef = doc(db, 'users', uid);
        const userSnap = await getDoc(userDocRef);
        if (userSnap.exists()) {
            const data = userSnap.data();
            setEmail(currentEmail || '');
            setTotalElevation(data.totalElevation || 0);
            setConqueredMountains(data.conqueredMountains || []);
            setCurrentMountain(data.currentMountain || 'None');
        }

        setFollowers(await getFollowers(uid));
        setFollowing(await getFollowing(uid));
        setPendingFollowers(await getPendingFollowers(uid));
    };

    const handleUnfollow = async (targetUid) => {
        await unfollowUser(targetUid);
        fetchUserData();
    };

    const handleViewProfile = async (userId) => {
        const profile = await getUserProfile(userId);
        if (profile) {
            setSelectedProfile(profile);
        }
    };

    const handleApprove = async (followerId) => {
        await approveFollower(followerId);
        fetchUserData();
    };

    const handleSearch = async () => {
        setIsFollowing(false); // ✅ Reset
        setHasRequested(false); // ✅ Reset

        const result = await searchUserByEmail(searchEmail);
        setSearchResult(result);

        if (result) {
            const currentUid = auth.currentUser?.uid;
            const targetUid = result.uid;

            // check if following
            const followingUids = following.map(f => f.uid);
            const requestedUids = pendingFollowers.map(f => f.uid);

            if (followingUids.includes(targetUid)) {
                setIsFollowing(true); // ✅ Already following
            } else if (requestedUids.includes(targetUid)) {
                setHasRequested(true); // ✅ Already requested
            }
        }
    };

    const handleCancelRequest = async (targetUid) => {
        const currentUid = auth.currentUser?.uid;
        if (!currentUid || !targetUid) return;

        try {
            const targetRef = doc(db, 'users', targetUid);
            await updateDoc(targetRef, {
                pendingFollowers: arrayRemove(currentUid),
            });
            console.log('❌ Request cancelled');
            fetchUserData(); // ✅ Refresh local state
            setSearchResult(null); // Optional: hide result
        } catch (err) {
            console.error('Error cancelling request', err);
        }
    };



    const handleRemoveFollower = async (followerId) => {
        await removeFollower(followerId);
        fetchUserData();
    };

    const openModal = (type) => {
        setModalType(type);
        setModalVisible(true);
    };

    const renderModalContent = () => {
        
        let data = [];
        if (modalType === 'followers') data = followers;
        else if (modalType === 'following') data = following;
        else if (modalType === 'requests') data = pendingFollowers;

        return (
            <FlatList
                data={data}
                keyExtractor={(item) => item.uid}
                renderItem={({ item }) => (
                    <View style={styles.modalItem}>
                        <Text>{item.email}</Text>

                        {modalType === 'followers' && (
                            <TouchableOpacity onPress={() => handleRemoveFollower(item.uid)}>
                                <Text style={[styles.actionText, { color: 'red' }]}>Remove</Text>
                            </TouchableOpacity>
                        )}

                        {modalType === 'following' && (
                            <View style={{ flexDirection: 'row', gap: 10 }}>
                                <TouchableOpacity onPress={() => handleViewProfile(item.uid)}>
                                    <Text style={styles.actionText}>View Profile</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => handleUnfollow(item.uid)}>
                                    <Text style={[styles.actionText, { color: 'red' }]}>Unfollow</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                        {modalType === 'requests' && (
                            <TouchableOpacity onPress={() => handleApprove(item.uid)}>
                                <Text style={styles.actionText}>Approve</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                )}
            />
        );
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={100}  // tweak based on your navbar/header height
        >
            <ScrollView contentContainerStyle={styles.container}>
                <TouchableOpacity onPress={() => router.push('/Homepage/maindb')}>
                    <Text style={styles.goBack}>⬅ Go Back</Text>
                </TouchableOpacity>

                <Text style={styles.title}>User Profile</Text>

                <View style={styles.infoCard}>
                    <Image source={emailIcon} style={styles.icon} />
                    <Text style={styles.label}>Email:</Text>
                    <Text style={styles.info}>{email}</Text>
                </View>

                <View style={styles.infoCard}>
                    <Image source={elevationIcon} style={styles.icon} />
                    <Text style={styles.label}>Total Elevation:</Text>
                    <Text style={styles.info}>{totalElevation} m</Text>
                </View>

                <View style={styles.infoCard}>
                    <Image source={conqueredIcon} style={styles.icon} />
                    <Text style={styles.label}>Mountains Conquered:</Text>
                    <Text style={styles.info}>{conqueredMountains.join(', ') || 'None'}</Text>
                </View>

                <View style={styles.infoCard}>
                    <Image source={currentMountainIcon} style={styles.icon} />
                    <Text style={styles.label}>Current Mountain:</Text>
                    <Text style={styles.info}>{currentMountain}</Text>
                </View>

                <TouchableOpacity style={styles.actionButton} onPress={() => openModal('followers')}>
                    <Text style={styles.actionText}>Followers: {followers.length}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionButton} onPress={() => openModal('following')}>
                    <Text style={styles.actionText}>Following: {following.length}</Text>
                </TouchableOpacity>

                {pendingFollowers.length > 0 && (
                    <TouchableOpacity style={styles.actionButton} onPress={() => openModal('requests')}>
                        <Text style={styles.actionText}>Follow Requests ({pendingFollowers.length})</Text>
                    </TouchableOpacity>
                )}

                <View style={styles.searchSection}>
                    <TextInput
                        placeholder="Search user by email"
                        value={searchEmail}
                        onChangeText={setSearchEmail}
                        style={styles.input}
                    />
                    <TouchableOpacity onPress={handleSearch} style={styles.searchButton}>
                        <Text style={styles.searchButtonText}>Search</Text>
                    </TouchableOpacity>

                    {searchResult && (
                        <View style={{ marginTop: 10 }}>
                            <Text>{searchResult.email}</Text>

                            {isFollowing ? (
                                <Text style={{ color: 'gray' }}>Already Following</Text> // ✅
                            ) : hasRequested ? (
                                <TouchableOpacity onPress={() => handleCancelRequest(searchResult.uid)} style={styles.unfollowButton}>
                                    <Text style={styles.unfollowText}>Cancel Request</Text> {/* ✅ */}
                                </TouchableOpacity>
                            ) : (
                                <TouchableOpacity onPress={async () => {
                                    await followUser(searchResult.uid);
                                    fetchUserData(); // refresh status
                                    setHasRequested(true);
                                }} style={styles.followButton}>
                                    <Text style={styles.followText}>Follow</Text> {/* ✅ */}
                                </TouchableOpacity>
                            )}
                        </View>
                    )}


                </View>

                <Modal visible={modalVisible} animationType="slide" transparent={false}>
                    <SafeAreaView style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>{modalType.charAt(0).toUpperCase() + modalType.slice(1)}</Text>
                        <View style={{ flex: 1, marginVertical: 10 }}>{renderModalContent()}</View>
                        <TouchableOpacity onPress={() => setModalVisible(false)} style={{ alignSelf: 'center', marginVertical: 20 }}>
                            <Text style={styles.closeText}>Close</Text>
                        </TouchableOpacity>
                    </SafeAreaView>
                </Modal>

                <Modal visible={selectedProfile !== null} animationType="fade" transparent={true}>
                    <View style={styles.profileModalContainer}>
                        <View style={styles.profileModalContent}>
                            <Text style={styles.modalTitle}>User Profile</Text>
                            <Text>Email: {selectedProfile?.email}</Text>
                            <Text>Total Elevation: {selectedProfile?.totalElevation || 0} m</Text>
                            <Text>Mountains Conquered: {selectedProfile?.conqueredMountains?.join(', ') || 'None'}</Text>
                            <Text>Current Mountain: {selectedProfile?.currentMountain || 'None'}</Text>
                            <TouchableOpacity onPress={() => setSelectedProfile(null)} style={{ marginTop: 20 }}>
                                <Text style={styles.closeText}>Close</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>

            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: { padding: 20, backgroundColor: '#FAFAFA' },
    goBack: { fontSize: 16, color: '#007BFF', marginBottom: 20 },
    title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 30 },
    infoCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        padding: 15,
        marginBottom: 20,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 3,
    },
    icon: { width: 30, height: 30, marginRight: 15 },
    label: { fontWeight: 'bold', fontSize: 16, flex: 1 },
    info: { fontSize: 16, flex: 2 },
    actionButton: {
        backgroundColor: '#E0E0E0',
        padding: 12,
        borderRadius: 8,
        marginVertical: 5,
    },
    actionText: { fontSize: 16, fontWeight: 'bold' },
    searchSection: { marginTop: 20 },
    input: {
        borderWidth: 1,
        borderColor: 'gray',
        padding: 8,
        borderRadius: 5,
        marginBottom: 10,
    },
    searchButton: {
        backgroundColor: '#007BFF',
        padding: 10,
        borderRadius: 5,
        marginBottom: 10,
        alignItems: 'center',
    },
    searchButtonText: { color: 'white', fontWeight: 'bold' },
    modalContainer: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 20,
        backgroundColor: '#fff',
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 15,
        textAlign: 'center',
    },
    modalItem: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    closeText: { color: 'red', textAlign: 'center', marginTop: 10 },
    profileModalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    profileModalContent: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        width: '80%',
    },
    followButton: {
        marginTop: 10,
        backgroundColor: '#007BFF',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
    },
    followText: {
        color: 'white',
        fontWeight: 'bold',
    },
    unfollowButton: {
        marginTop: 10,
        backgroundColor: 'red',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
    },
    unfollowText: {
        color: 'white',
        fontWeight: 'bold',
    },
    // profileOverlay: {
    //     position: 'absolute',
    //     top: 0,
    //     bottom: 0,
    //     left: 0,
    //     right: 0,
    //     backgroundColor: 'rgba(0,0,0,0.5)', // dimmed backdrop
    //     justifyContent: 'center',
    //     alignItems: 'center',
    //     zIndex: 999,
    // },

    // profilePopup: {
    //     backgroundColor: 'white',
    //     padding: 20,
    //     borderRadius: 10,
    //     width: '85%',
    //     shadowColor: '#000',
    //     shadowOffset: { width: 0, height: 2 },
    //     shadowOpacity: 0.3,
    //     shadowRadius: 10,
    //     elevation: 10,
    //     alignItems: 'center',
    // },

    // profileText: {
    //     fontSize: 16,
    //     marginBottom: 8,
    //     textAlign: 'center',
    // },

    // backButton: {
    //     marginTop: 15,
    //     backgroundColor: '#007BFF',
    //     paddingVertical: 10,
    //     paddingHorizontal: 20,
    //     borderRadius: 8,
    // },

    // backButtonText: {
    //     color: 'white',
    //     fontWeight: 'bold',
    //     fontSize: 16,
    // },
});

export default UserProfile;
