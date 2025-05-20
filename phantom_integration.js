if (typeof window.SolanaWeb3 === 'undefined') {
  console.error('SolanaWeb3 is not defined. Please ensure the Solana web3.js script is loaded.');
  throw new Error('Solana web3.js library not loaded.');
}

const { Connection, PublicKey, Transaction, SystemProgram } = window.SolanaWeb3;

const connectWallet = async () => {
  if (!window.solana || !window.solana.isPhantom) {
    throw new Error('Phantom wallet not detected. Please install the Phantom extension.');
  }
  try {
    await window.solana.connect();
    return window.solana.publicKey.toString();
  } catch (error) {
    console.error('Connection failed:', error);
    throw error;
  }
};

const getBalance = async (publicKeyStr) => {
  const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
  try {
    const publicKey = new PublicKey(publicKeyStr);
    const balance = await connection.getBalance(publicKey);
    return balance / 1e9; // Convert lamports to SOL
  } catch (error) {
    console.error('Failed to fetch balance:', error);
    throw error;
  }
};

const executeTrade = async (publicKeyStr, recipientAddress, amount) => {
  const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
  try {
    const senderPublicKey = new PublicKey(publicKeyStr);
    const recipientPublicKey = new PublicKey(recipientAddress);
    const lamports = amount * 1e9; // Convert SOL to lamports

    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: senderPublicKey,
        toPubkey: recipientPublicKey,
        lamports,
      })
    );

    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = senderPublicKey;

    const signedTransaction = await window.solana.signTransaction(transaction);
    const signature = await connection.sendRawTransaction(signedTransaction.serialize());
    await connection.confirmTransaction(signature);
    return signature;
  } catch (error) {
    console.error('Trade execution failed:', error);
    throw error;
  }
};

// Example usage
(async () => {
  try {
    const publicKey = await connectWallet();
    console.log('Connected wallet:', publicKey);

    const balance = await getBalance(publicKey);
    console.log('Balance:', balance, 'SOL');

    const recipient = 'RECIPIENT_PUBLIC_KEY_HERE'; // Replace with actual recipient address
    const amount = 0.1; // Amount in SOL
    const signature = await executeTrade(publicKey, recipient, amount);
    console.log('Transaction signature:', signature);
  } catch (error) {
    console.error('Error:', error);
  }
})();