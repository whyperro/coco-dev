// utils/axiosNoCache.ts
import axios from 'axios';

const axiosNoCache = axios.create({
    headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
        },
});

export default axiosNoCache;
