import { ActionAdapter, ActionContext } from '@dialectlabs/blinks';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import {
  PublicKey,
  TransactionInstruction,
  TransactionMessage,
  VersionedTransaction,
} from '@solana/web3.js';
import * as base58 from 'bs58';
import { useEffect, useRef } from 'react';
import { CANVAS_WALLET_NAME, canvasClient } from './canvas-client';

const MEMO_PROGRAM_ID = 'MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr';

const base64tobase58 = (base64: string) => {
  return base58.encode(Buffer.from(base64, 'base64'));
};

const parseTransaction = (base58Tx: string) => {
  const txUint8Array = base58.decode(base58Tx);

  try {
    return VersionedTransaction.deserialize(txUint8Array);
  } catch (error) {
    console.error('Error parsing transaction:', error);
    return null;
  }
};

const addMemoTracker = async (base64Tx: string, address: string) => {
  let base58Tx = base64tobase58(base64Tx);

  try {
    const tx = parseTransaction(base58Tx);

    //can't compose already signed transactions
    let isSigned = tx.signatures.some((sig) => sig.some((s) => s > 0));
    if (isSigned) {
      return base58Tx;
    }

    //handle tx with lookup tables later
    if (tx.message.addressTableLookups.length > 0) {
      return base58Tx;
    }

    var txMessage = TransactionMessage.decompile(tx.message);
    txMessage.instructions.push(
      new TransactionInstruction({
        programId: new PublicKey(MEMO_PROGRAM_ID),
        data: Buffer.from('dscvr.one', 'utf8'),
        keys: [
          {
            pubkey: new PublicKey(address),
            isSigner: true,
            isWritable: false,
          },
        ],
      })
    );

    let newMessage =
      tx.version == 'legacy'
        ? txMessage.compileToLegacyMessage()
        : txMessage.compileToV0Message();

    let newTx = new VersionedTransaction(newMessage);

    const serializedNewTransaction = newTx.serialize();

    if (serializedNewTransaction.byteLength > 1232) {
      return base58Tx;
    }
    return base58.encode(serializedNewTransaction);
  } catch (error) {
    console.error('Error adding memo tracker:', error);
    return base58Tx;
  }
};

export const useCanvasAdapter = () => {
  const { connection } = useConnection();
  const { select, connect, wallets, wallet } = useWallet();
  const canvasAdapterRef = useRef<ActionAdapter | undefined>();

  useEffect(() => {
    if (!CANVAS_WALLET_NAME || wallet?.adapter.name === CANVAS_WALLET_NAME)
      return;
    const exists = wallets.find((w) => w.adapter.name === CANVAS_WALLET_NAME);
    if (exists) {
      select(exists.adapter.name);
    }
  }, [wallets, wallet]);

  const initialize = async () => {
    canvasAdapterRef.current = createAdapter();
    if (!canvasClient) return;
    canvasClient.ready().then(() => {
      console.log('Canvas client ready');
    });
  };

  const createAdapter = () => {
    const adapter: ActionAdapter = {
      connect: async (_context: ActionContext) => {
        try {
          if (!canvasClient) {
            throw new Error('Canvas client not initialized');
          }

          await connect();
          if (!wallet.adapter.connected) {
            throw new Error('Failed to connect wallet');
          }
          return wallet.adapter.publicKey.toString();
        } catch (error) {
          console.error('Connection error:', error);
          return null;
        }
      },

      signTransaction: async (tx: string, _context: ActionContext) => {
        try {
          console.log('signTransaction', tx);
          const unsignedTxMemo = await addMemoTracker(
            tx,
            wallet.adapter.publicKey.toString()
          );
          // const unsignedTx = base58.decode(tx);
          const unsignedTx = parseTransaction(base64tobase58(tx));
          const signature = await wallet.adapter.sendTransaction(
            unsignedTx,
            connection
          );

          return { signature };
        } catch (error) {
          console.error('Transaction signing error:', error);
          return { error: 'Failed to sign transaction' };
        }
      },

      confirmTransaction: async (
        _signature: string,
        _context: ActionContext
      ) => {
        try {
          await true;
        } catch (error) {
          console.error('Transaction confirmation error:', error);
        }
      },
    };

    return adapter;
  };

  return {
    initialize,
    canvasAdapterRef,
  };
};
