import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import * as web3 from '@solana/web3.js';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { FC, useState } from 'react';
import styles from '../styles/Home.module.css';
import {
  createMintToInstruction,
  getAssociatedTokenAddress,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAccount,
} from '@solana/spl-token';

export const MintToForm: FC = () => {
  const [txSig, setTxSig] = useState('');
  const [tokenAccount, setTokenAccount] = useState('');
  const [balance, setBalance] = useState('');
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const link = () => {
    return txSig
      ? `https://explorer.solana.com/tx/${txSig}?cluster=devnet`
      : '';
  };

  const mintTo = async (event) => {
    event.preventDefault();
    if (!connection || !publicKey) {
      return;
    }
    const MINOR_UNITS_PER_MAJOR_UNITS = Math.pow(10, 8);
    const mint = new web3.PublicKey(event.target.mint.value);
    const recipient = new web3.PublicKey(event.target.recipient.value);
    const amount = Number(event.target.amount.value);

    const transaction = new web3.Transaction().add(
      createMintToInstruction(
        mint,
        recipient,
        publicKey,
        amount * MINOR_UNITS_PER_MAJOR_UNITS
      )
    );

    const tx = await sendTransaction(transaction, connection);

    setTxSig(tx);

    const associatedTokenAddress = await getAssociatedTokenAddress(
      mint,
      publicKey,
      false
    );

    const accountInfo = await getAccount(connection, associatedTokenAddress)

    setBalance((accountInfo.amount / BigInt(MINOR_UNITS_PER_MAJOR_UNITS)).toString())
  };

  return (
    <div>
      <br />
      {publicKey ? (
        <form onSubmit={mintTo} className={styles.form}>
          <label htmlFor="mint">Token Mint:</label>
          <input
            id="mint"
            type="text"
            className={styles.formField}
            placeholder="Enter Token Mint"
            required
          />
          <label htmlFor="recipient">Recipient:</label>
          <input
            id="recipient"
            type="text"
            className={styles.formField}
            placeholder="Enter Recipient PublicKey"
            required
          />
          <label htmlFor="amount">Amount Tokens to Mint:</label>
          <input
            id="amount"
            type="text"
            className={styles.formField}
            placeholder="e.g. 100"
            required
          />
          <button type="submit" className={styles.formButton}>
            Mint Tokens
          </button>
        </form>
      ) : (
        <span></span>
      )}
      {txSig ? (
        <div>
          <p>Token Balance: {balance} </p>
          <p>View your transaction on </p>
          <a href={link()}>Solana Explorer</a>
        </div>
      ) : null}
    </div>
  );
};
