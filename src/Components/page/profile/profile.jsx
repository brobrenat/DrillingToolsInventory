import React, { useState, useEffect } from 'react';
import { supabase } from '../../../createClient';
import './profile.css';
import Sidebar from '../../sidebar/Sidebar';

const Profile = ({ sidebar }) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [users, setUsers] = useState([]);
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        fetchUsers();
        fetchCurrentUser();
    }, []);

    const fetchCurrentUser = () => {
        const username = localStorage.getItem('username');
        setCurrentUser(username);
    };

    const fetchUsers = async () => {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('username, role');

            if (error) throw error;
            setUsers(data);
        } catch (err) {
            setError('Failed to fetch users');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setError('New passwords do not match');
            return;
        }

        try {
            setLoading(true);
            const { error } = await supabase
                .from('User')
                .update({ password: passwordForm.newPassword })
                .eq('username', currentUser)
                .eq('password', passwordForm.currentPassword);

            if (error) throw error;

            setSuccess('Password updated successfully');
            setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err) {
            setError('Failed to update password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="profile-page">
            {sidebar && <Sidebar />}
            <div className="profile-content">
                <h1>User Management</h1>
                <div className="profile-container">
                    <div className="users-table-container">
                        <h2>Users & Access Levels</h2>
                        <table className="users-table">
                            <thead>
                                <tr>
                                    <th>Username</th>
                                    <th>Role</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(user => (
                                    <tr key={user.username}>
                                        <td>{user.username}</td>
                                        <td>
                                            <span className={`role-badge ${user.role.toLowerCase()}`}>
                                                {user.role}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="password-change-section">
                        <h2>Change Password</h2>
                        <form onSubmit={handlePasswordChange} className="password-form">
                            <div className="form-group">
                                <label>Current Password</label>
                                <input
                                    type="password"
                                    value={passwordForm.currentPassword}
                                    onChange={(e) => setPasswordForm({
                                        ...passwordForm,
                                        currentPassword: e.target.value
                                    })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>New Password</label>
                                <input
                                    type="password"
                                    value={passwordForm.newPassword}
                                    onChange={(e) => setPasswordForm({
                                        ...passwordForm,
                                        newPassword: e.target.value
                                    })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Confirm New Password</label>
                                <input
                                    type="password"
                                    value={passwordForm.confirmPassword}
                                    onChange={(e) => setPasswordForm({
                                        ...passwordForm,
                                        confirmPassword: e.target.value
                                    })}
                                    required
                                />
                            </div>
                            {error && <div className="error-message">{error}</div>}
                            {success && <div className="success-message">{success}</div>}
                            <button type="submit" disabled={loading}>
                                {loading ? 'Updating...' : 'Update Password'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;