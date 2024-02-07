import React, {useState, useEffect, forwardRef, useRef, useContext, useImperativeHandle} from "react";
import { useAccount, } from "wagmi"
import { encodeBase64, toUtf8Bytes } from "ethers";
import { PageContext } from "../utils/context"
import { Akord, Auth, NFTMetadata } from "@akord/akord-js";
import { vaultId } from "../pages/_app";

export interface CanShowAlert {
  showAlert(): void;
  handleUploadToArweave(e: any): Promise<void>;
}

// 从父组件接收的
interface Props {
  name: string;
  goal: string;
  onArweaveIdSet: (name: string) => void; // 函数类型的 prop，用于从 Arweave 传递 name
  onSetMintRes: (name: string) => void; // 设置 NFT mint 状态
}

// Arweave 组件
const UploadToArweave = forwardRef<CanShowAlert, Props>(  
  ({name, goal, onArweaveIdSet, onSetMintRes }, ref,) => {

  const { address } = useAccount()
  const { akord } = useContext(PageContext)
  // console.log("akord in UploadToArweave", akord)

  const [nftId, setNftId] = useState<string | null>(null); // 存储 mint 后的 nftId

  // 让父组件调用其中的 handleUploadToArweave(e)
  // https://stackoverflow.com/questions/66363320/call-child-function-from-parent-in-reactjs-using-useref
  useImperativeHandle(
    ref,
    () => ({
         showAlert() {
            alert("Child Function Called")
            console.log('hello world')
        },

        async handleUploadToArweave(e: any) {
          e.preventDefault();

          if (!akord) { 
            console.error('No akord!'); return; 
          }
    
          try {
            // const nfts = await akord.nft.listAll(vaultId);
            // console.log("akord notes", nfts);
            console.log("goal, name from father component: ", goal, name);

            const nftMetadata: NFTMetadata = {
              name: "Base64: " + encodeBase64(toUtf8Bytes(goal))?.toString() ,
              creator: "Base64: " + encodeBase64(toUtf8Bytes(name))?.toString() || "",
              owner: "Base64: " + encodeBase64(toUtf8Bytes(name))?.toString() || "",
              collection: "flagDAO",
              description: "Base64: " + encodeBase64(toUtf8Bytes(goal))?.toString(),
              type: "document",
              topics: [""]
            };
      
            // 创建一个新的 Blob 对象，它是 File 接口的基础
            const blob: Blob = new Blob([name+goal || "1", ], { type: 'text/plain' });
            const file = new File([blob], "flag.txt", { type: 'text/plain' }); // 使用 Blob 对象创建一个 File 对象
            onSetMintRes("Minting");  // 给父组件传值. 这个要在 mint 之前设置，否则会有延迟.
            const response = await akord?.nft.mint(vaultId, file, nftMetadata);
            // console.log("response.object\n", response.object)
            // console.log("response.transactionId\n", response.transactionId)

            if(response.nftId){
              setNftId(response.nftId);
              onArweaveIdSet(response.nftId);  // 向父组件传递 nftId 的值.
              console.log('NFT minted with ID:', response?.nftId);
            }
          } catch (error) {
            onSetMintRes("Error");
            console.error('Error minting NFT:\n', error);
          }
        } // handleUploadToArweave
    }),
  )
  return (<></>)
})

export default UploadToArweave;