import { Handler } from './Handler'
import { Router } from 'itty-router'
import info from './info.json';

// Create a new router
const router = Router();

const balances: { [key: string]: string } = info.balances,
    ethendpoint: string = info.ethendpoint,
    polygonendpoint : string = info.polyendpoint,
    tokenAddress: string = info.token.address,
    tokenSupply: string = info.token.supply,
    tokenDecimals: number = info.token.decimals;

router.get('/', (async () => {
    const handler = new Handler(
        ethendpoint,
        polygonendpoint,
        tokenAddress,
        balances,
        tokenSupply,
        tokenDecimals,
    );

    return await handler.handleRequest('total');
}));

router.get('/circulating', (async () => {
    const handler = new Handler(
        ethendpoint,
        polygonendpoint,
        tokenAddress,
        balances,
        tokenSupply,
        tokenDecimals,
    );

    return await handler.handleRequest('circulating');
}))

router.get('/total', (async () => {
    const handler = new Handler(
        ethendpoint,
        polygonendpoint,
        tokenAddress,
        balances,
        tokenSupply,
        tokenDecimals,
    );

    return await handler.handleRequest('total');
}))

router.all('*', () => new Response('Not Found.', { status: 404 }))

addEventListener('fetch', ((event) => {
    event.respondWith(router.handle(event.request))
}));
