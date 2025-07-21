import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet } from 'react-native';
import { searchUserByEmail, followUser, unfollowUser, approveFollower, getFollowers, getFollowing, getPendingFollowers } from '../../utils/socialstorage';
console.log('socialstorage:', ss);
import { auth, db } from '../../utils/firebase';
import { doc, getDoc } from 'firebase/firestore';

const SocialScreen = () => {
    const [searchEmail, setSearchEmail] = useState('');
    const [searchResult, setSearchResult] = useState(null);
    const [followers, setFollowers] = useState([]);
    const [following, setFollowing] = useState([]);
    const [pendingFollowers, setPendingFollowers] = useState([]);

    useEffect(() => {
        loadConnections();
    }, []);

    const loadConnections = async () => {
        const uid = auth.currentUser?.uid;
        if (!uid) return;

        try {
            // Load current user data
            const userRef = doc(db, 'users', uid);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
                const data = userSnap.data();
                setPendingFollowers(data.pendingFollowers || []);
            }

            const myFollowers = await getFollowers(uid);
            const myFollowing = await getFollowing(uid);
            const myPendingFollowers = await getPendingFollowers(uid);

            setFollowers(myFollowers);
            setFollowing(myFollowing);
            setPendingFollowers(myPendingFollowers);
        } catch (error) {
            console.error('❌ Error loading connections:', error);
        }
    };

    const handleSearch = async () => {
        const result = await searchUserByEmail(searchEmail);
        setSearchResult(result);
    };

    const handleFollow = async (targetUid) => {
        await followUser(targetUid);
        loadConnections();
    };

    const handleUnfollow = async (targetUid) => {
        await unfollowUser(targetUid);
        loadConnections();
    };

    const handleApprove = async (followerId) => {
        await approveFollower(followerId);
        loadConnections();
    };

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Social</Text>

            <TextInput
                placeholder="Search by Email"
                value={searchEmail}
                onChangeText={setSearchEmail}
                style={styles.input}
            />
            <Button title="Search" onPress={handleSearch} />

            {searchResult && (
                <View style={styles.card}>
                    <Text>Email: {searchResult.email}</Text>
                    <Button title="Follow" onPress={() => handleFollow(searchResult.uid)} />
                </View>
            )}

            <Text style={styles.subHeader}>Pending Followers</Text>
            <FlatList
                data={pendingFollowers}
                keyExtractor={(item) => item.uid}
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        <Text>Email: {item.email}</Text>
                        <Button title="Approve" onPress={() => handleApprove(item.uid)} />
                    </View>
                )}
            />

            <Text style={styles.subHeader}>Following</Text>
            <FlatList
                data={following}
                keyExtractor={(item) => item.uid}
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        <Text>{item.email}</Text>
                        <Button title="Unfollow" onPress={() => handleUnfollow(item.uid)} />
                    </View>
                )}
            />

            <Text style={styles.subHeader}>Followers</Text>
            <FlatList
                data={followers}
                keyExtractor={(item) => item.uid}
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        <Text>{item.email}</Text>
                    </View>
                )}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { padding: 20 },
    header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
    subHeader: { fontSize: 20, marginTop: 20, marginBottom: 10 },
    input: {
        borderWidth: 1,
        borderColor: 'gray',
        padding: 8,
        marginBottom: 10,
        borderRadius: 5,
    },
    card: {
        padding: 12,
        backgroundColor: '#f0f0f0',
        borderRadius: 8,
        marginBottom: 10,
    },
});

export default SocialScreen;
