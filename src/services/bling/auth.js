import base64 from 'base-64';
import { getConfig, saveTokens, getTokens } from '../../repositories/configRepository.js';

async function getToken() {
    const { clientId, secretKey, accessCode } = await getConfig();

    let credentials = base64.encode(clientId + ':' + secretKey);
    let options = {
        method: 'POST',
        body: new URLSearchParams({
            'grant_type': 'authorization_code',
            'code': accessCode
        }),
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${credentials}`
        }
    };
    
    try {
        let reqs = await fetch(`https://www.bling.com.br/Api/v3/oauth/token`, options);
        let ress = await reqs.json();

        if (!reqs.ok) {
            throw new Error(ress.error || 'Erro ao obter token');
        }

        // Save tokens in variables
        const accessToken = ress.access_token;
        const refreshToken = ress.refresh_token;
        const expiresIn = ress.expires_in;

        // Save tokens and expiration in the database
        await saveTokens(accessToken, refreshToken, Date.now() + (expiresIn * 1000));

        return accessToken;
    } catch (error) {
        console.error('Erro ao obter token:', error);
        throw error;
    }
}

async function refreshToken() {
    const { clientId, secretKey } = await getConfig();
    const { refreshToken: currentRefreshToken } = await getTokens();

    if (!currentRefreshToken) {
        throw new Error('Refresh token não encontrado');
    }

    let credentials = base64.encode(clientId + ':' + secretKey);
    let options = {
        method: 'POST',
        body: new URLSearchParams({
            'grant_type': 'refresh_token',
            'refresh_token': currentRefreshToken
        }),
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${credentials}`
        }
    };

    try {
        let reqs = await fetch(`https://www.bling.com.br/Api/v3/oauth/token`, options);
        let ress = await reqs.json();

        if (!reqs.ok) {
            throw new Error(ress.error || 'Erro ao atualizar token');
        }

        // Save new tokens in the database
        await saveTokens(
            ress.access_token, 
            ress.refresh_token,
            Date.now() + (ress.expires_in * 1000)
        );

        return ress.access_token;
    } catch (error) {
        console.error('Erro ao atualizar token:', error);
        throw error;
    }
}

async function getValidToken() {
    const tokens = await getTokens();
    
    if (!tokens) {
        return await getToken();
    }

    // If token is expired or will expire in next 5 minutes
    if (Date.now() >= (tokens.expiresAt - 300000)) {
        return await refreshToken();
    }

    return tokens.accessToken;
}

export { getToken, refreshToken, getValidToken };



