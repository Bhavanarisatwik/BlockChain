
const { JsonRpcProvider } = require("ethers");

async function testRpc(url, name) {
    console.log(`Testing ${name} (${url})...`);
    try {
        const provider = new JsonRpcProvider(url);
        const block = await provider.getBlockNumber();
        console.log(`✅ ${name} Success! Block: ${block}`);
        return true;
    } catch (e) {
        console.log(`❌ ${name} Failed: ${e.message}`);
        return false;
    }
}

async function main() {
    const infuraUrl = "https://sepolia.infura.io/v3/0e6b62eb04f94e76b8f952550d73c2fc";
    const oneRpcUrl = "https://1rpc.io/sepolia";
    const publicUrl = "https://ethereum-sepolia-rpc.publicnode.com";

    await testRpc(infuraUrl, "Infura");
    await testRpc(oneRpcUrl, "1RPC");
    await testRpc(publicUrl, "PublicNode");
}

main();
