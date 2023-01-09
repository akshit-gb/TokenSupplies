import { BigNumber, ethers } from 'ethers';

import BEP20_ABI from './bep20_abi.json';
import { JsonFragment } from '@ethersproject/abi';
import { RPCApi } from './RpcApi';

export class Handler {
    bepAbi: ReadonlyArray<JsonFragment> = BEP20_ABI;
    ethRpcApi: RPCApi | undefined;
    polyRpcApi: RPCApi | undefined;

    constructor (
        private ethendpoint: string,
        private polyendpoint : string,
        private address: string,
        private balances: { [key: string]: string },
        private _totalSupply: string,
        private tokenDecimals: number,
    ) {
        this.ethRpcApi = new RPCApi({
            endpoint: this.ethendpoint,
            address: this.address,
            abi: this.bepAbi,
        })

        this.polyRpcApi = new RPCApi({
            endpoint: this.polyendpoint,
            address: this.address,
            abi: this.bepAbi,
        });
    } 

    private get ETHapi(): RPCApi {
        return this.ethRpcApi as RPCApi;
    }

    private get POLYapi(): RPCApi {
        return this.polyRpcApi as RPCApi;
    }

    private async getBalanceETH(address: string): Promise<number> {
        return await this.ETHapi.balanceOf(address);
    }

    private async getBalancePOLY(address: string): Promise<number> {
        return await this.POLYapi.balanceOf(address);
    }

    private async circulatingSupply(): Promise<string> {
        const addresses = Object.keys(this.balances).map(key => this.balances[key]);

        let totalLocked = BigNumber.from(this._totalSupply)

        for (let index = 0; index < addresses.length; index++) {
            const balanceETH = (await this.getBalanceETH(addresses[index]))/Math.pow(10,18);
            const balancePOLY = (await this.getBalancePOLY(addresses[index]))/Math.pow(10,18);
            console.log(balanceETH)
            console.log(balancePOLY)

            totalLocked = totalLocked.sub(BigNumber.from((ethers.utils.parseUnits(balanceETH.toString(),18))));
            totalLocked = totalLocked.sub(BigNumber.from((ethers.utils.parseUnits(balancePOLY.toString(),18))));
        }

        return ethers.utils.formatUnits(totalLocked, this.tokenDecimals);
    }

    private async totalSupply(): Promise<string> {
        let totalLocked = BigNumber.from(this._totalSupply)

        const deadAmount = await this.getBalanceETH(this.balances.dead);

        totalLocked = totalLocked.sub(BigNumber.from((deadAmount).toString()));

        return ethers.utils.formatUnits(totalLocked, this.tokenDecimals);
    }

    async handleRequest(type: 'circulating' | 'total'): Promise<Response> {
        if (type === 'circulating') {
            return new Response(await this.circulatingSupply())
        }

        return new Response(await this.totalSupply());
    }
}
