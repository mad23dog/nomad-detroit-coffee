function AdminLogin() {
    try {
        const [isLoggedIn, setIsLoggedIn] = React.useState(false);
        const [username, setUsername] = React.useState('');
        const [password, setPassword] = React.useState('');
        const [error, setError] = React.useState('');

        const handleLogin = (e) => {
            e.preventDefault();
            // In a real application, this should be a secure API call
            if (username === 'SeanMarc' && password === 'Coffee4Lyfe!') {
                setIsLoggedIn(true);
                setError('');
                // Store login state
                localStorage.setItem('adminLoggedIn', 'true');
                window.dispatchEvent(new Event('adminLoginChanged'));
            } else {
                setError('Invalid credentials');
            }
        };

        const handleLogout = () => {
            setIsLoggedIn(false);
            setUsername('');
            setPassword('');
            localStorage.removeItem('adminLoggedIn');
            window.dispatchEvent(new Event('adminLoginChanged'));
        };

        React.useEffect(() => {
            const isAdminLoggedIn = localStorage.getItem('adminLoggedIn') === 'true';
            setIsLoggedIn(isAdminLoggedIn);
        }, []);

        if (isLoggedIn) {
            return (
                <div className="admin-section" data-name="admin-logged-in">
                    <p className="text-green-600 mb-4">Logged in as administrator</p>
                    <button 
                        onClick={handleLogout}
                        className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
                        data-name="logout-button"
                    >
                        Logout
                    </button>
                </div>
            );
        }

        return (
            <div className="admin-section" data-name="admin-login">
                <h3 className="text-xl font-semibold mb-4">Administrator Login</h3>
                {error && <p className="text-red-600 mb-4" data-name="error-message">{error}</p>}
                <form onSubmit={handleLogin} className="space-y-4" data-name="login-form">
                    <div>
                        <input
                            type="text"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full px-4 py-2 border rounded focus:outline-none focus:border-blue-500"
                            data-name="username-input"
                        />
                    </div>
                    <div>
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2 border rounded focus:outline-none focus:border-blue-500"
                            data-name="password-input"
                        />
                    </div>
                    <button 
                        type="submit"
                        className="w-full bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition-colors"
                        data-name="login-button"
                    >
                        Login
                    </button>
                </form>
            </div>
        );
    } catch (error) {
        reportError(error);
        return null;
    }
}
