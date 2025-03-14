const API_URL = 'http://localhost:3001';

export const addUserToDatabase = async (user: any) => {
    try {
        const response = await fetch(`${API_URL}/api/add-user`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(user),
        });

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Error adding user:', error);
    }
};

export const fetchWallet = async (email: string) => {
    try {
        const response = await fetch(`${API_URL}/api/fetch-wallet/${email}/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Error adding user:', error);
    }
}


export const sendServerTransaction = async (email: string, to: string, valueInEth: string) => {
    try {
        const response = await fetch(`${API_URL}/api/send-transaction`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, to, valueInEth }),
        });
        const result = await response.json();
        return result;
    } catch (error) {
        console.log('Error sending transaction:', error);
    }
}


export const getSavedWallets = async (email: string) => {
    try {
        const response = await fetch(`${API_URL}/api/saved-wallets/${email}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        const result = await response.json();
        return result;
    } catch (error) {
        console.log("Error fetching saved wallets:", error);
    }
}


export const saveWallet = async (email: string, address: string, nickname: string) => {
    try {
        const response = await fetch(`${API_URL}/api/saved-wallets`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, address, nickname }),
        });
        const result = await response.json();
        return result;
    } catch (error) {
        console.log("Error saving wallet:", error);
    } 
}

export const deleteWallet = async (email: string, address: string) => {
    try {
        const response = await fetch(`${API_URL}/api/saved-wallets`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, address }),
        });
        const result = await response.json();
        return result;
    } catch (error) {
        console.log("Error deleting wallet:", error);
    }
}