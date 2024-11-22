import React, { useState } from 'react';
import Cookies from 'js-cookie';
import { getCurrentUserWithToken } from './api';

function SendToken() {
    const sendToken = async () => {
        const [currentUser, setCurrentUser] = useState(null); // State to store current user ID
        useEffect(() => {
            const fetchCurrentUser = async () => {
                const userId = await getCurrentUserWithToken();
                setCurrentUser(userId);
            };
    
            fetchCurrentUser();
        }, []);

    return (
            <div>
                <button onClick={sendToken} type='submit'>{currentUser}</button>
            </div>
        );
    }
}
export default SendToken;
