import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import {
  useContractWrite,
  usePrepareContractWrite,
  useAccount,
  useContractRead
} from "wagmi";
import {contractABI, FLAGDAO_CONTRACT_ADDR, REACT_APP_CHAIN_ID,
  ercABI, ERC20_CONTRACT_ADDR} from "../utils/constants";


type HoverModalProps = {
  bettors_plg: number;
  flag_id: number;
};

type CombinedElement = {
  addr: string;
  val: string;
};


const BettorsModal: React.FC<HoverModalProps> = ({bettors_plg, flag_id}) => {
  const [modalIsOpen, setIsOpen] = useState(false);
  const [bettors, setBettors] = useState<CombinedElement[]>();

  function openModal() { setIsOpen(true); }
  function closeModal() { setIsOpen(false); }

  // useEffect(() => {
  //   refetch();
  // },[])

  const { data, isError, isLoading, refetch, isFetching ,error} = useContractRead({
    address: FLAGDAO_CONTRACT_ADDR,
    abi: contractABI,
    functionName: 'getBettors',
    args: [flag_id]
  })

  const { data: value, isError: iserr, isLoading: islding, refetch: refect, isFetching: isrefetcing ,error: err} = useContractRead({
    address: FLAGDAO_CONTRACT_ADDR,
    abi: contractABI,
    functionName: 'getBettorsPledgement',
    args: [flag_id]
  })

  const combineLists = (addr: string[], val: string[]): CombinedElement[] => {
    return addr.map((key, i) => ({ addr: key, val: val[i] }));
  };

  useEffect(() => {
    // Assert that `data` and `value` are string arrays
    if (Array.isArray(data) && Array.isArray(value) && data && value) {
      setBettors(combineLists(data, value)); 
    }
  },[data, value]);

  // console.log("flag_id", flag_id);
  // console.log("getBettors data", data);
  // console.log("getBettors bettors", bettors);


  return (
    <div className="relative inline-block">

      <button 
        onClick={openModal} 
        onMouseMove={closeModal}
        className="text-sm pt-1 pr-1 ml-4 underline">Bettors: </button> <span className="text-lg font-bold text-lime-700">
            ${bettors_plg.toString()}
      </span>

      <Modal 
        isOpen={modalIsOpen} 
        className="flex items-center justify-center w-full h-full"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        
        <div className="bg-slate-50 rounded-lg shadow-lg w-2/5 py-10 px-10 relative">
          <h4 className="text-2xl mb-4 text-center font-black">Bettors: </h4>
          <button onClick={closeModal} 
            className="absolute top-2 left-2 bg-gradient-to-r from-red-200 via-red-300 to-yellow-200 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-red-100 dark:focus:ring-red-400 rounded-lg text-white font-bold py-1 px-2"
          >
            X
          </button>

          <div className="relative overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-900 uppercase dark:text-gray-400">
                        <tr>
                            <th scope="col" className="px-6 py-3">
                                Address
                            </th>
                            <th scope="col" className="px-6 py-3">
                              Bettor's Pledgement
                            </th>
                        </tr>
                    </thead>
                    <tbody>

                    {
                      bettors?.map( (item) => {
                      return (
                        <tr className="bg-white dark:bg-gray-800">
                            <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                {item.addr.slice(0,5)}......{item.addr.slice(-5,)}
                            </th>
                            <td className="px-6 py-4">
                                ${item.val.toString()}
                            </td>
                        </tr>
                      )})
                    }
                    </tbody>
                </table>
              </div>
        </div>
      </Modal>          
    </div>
  );
}

export default BettorsModal;
