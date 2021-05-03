
import React, { useState, useEffect } from "react";
import * as fcl from "@onflow/fcl";
import { Address } from "@onflow/types";
import * as t from "@onflow/types"


const TokenData = () => {
  const [user, setUser] = useState({loggedIn: null})
  useEffect(() => fcl.currentUser().subscribe(setUser), [])
  const [nftInfo, setNftInfo] = useState(null)
  const fetchTokenData = async () => {
    const encoded = await fcl
      .send([
        fcl.script`
        import NonFungibleTicket from 0xf8d6e0586b0a20c7
        pub fun main() : {String : String} {
          let nftOwner = getAccount(0xf8d6e0586b0a20c7)  
          let capability = nftOwner.getCapability<&{NonFungibleTicket.NFTReceiver}>(/public/NFTReceiver)
      
          let receiverRef = capability.borrow()
              ?? panic("Could not borrow the receiver reference")
      
          return receiverRef.getMetadata(id: 1)
        }
      `
      ])
    
    const decoded = await fcl.decode(encoded)
    setNftInfo(decoded)
  };
  return (
    <div className="listing">
      <div className="center">
        <button className="btn-primary" onClick={fetchTokenData}>Fetch Token Data</button>        
      </div>
      {
        nftInfo &&
        <div>
          <div className="center">
            <p>Event: {nftInfo["event"]}</p>
            <p>Section: {nftInfo["section"]}</p>
            <p>Row: {nftInfo["row"]}</p>
            <p>Seat: {nftInfo["seat"]}</p>
          </div>
          <div className="center video">
            <img src={nftInfo["uri"]} alt="My NFT!" width="90%"/>
            <div>
              <button onClick={() => setNftInfo(null)} className="btn-secondary">Clear Token Info</button>
            </div>
          </div>
        </div>
        
      }
    </div>
  );
};

const OwnerData = (account) => {
  const [ownerInfo, setOwnerInfo] = useState(null)
  const fetchOwnerData = async () => {
    const encoded = await fcl
      .send([
        fcl.args(
          fcl.arg(account, t.Address)
        ),
        fcl.script`
        import NonFungibleTicket from 0xf8d6e0586b0a20c7

        pub fun main() : [UInt64] {
            let acct1 = getAccount(account) 
            let capability1 = acct1.getCapability<&{NonFungibleTicket.NFTReceiver}>(/public/NFTReceiver)
            let receiverRef1 = capability1.borrow()
                ?? panic("Could not borrow the receiver reference")

            return receiverRef1.getIDs()
        }
      `
      ])
    
    const decoded = await fcl.decode(encoded)
    setOwnerInfo(decoded)
  };
  return (
    <div>
      <p>Account: {account}</p>
      <p>Owned NFT's: {ownerInfo}</p>
    </div>
  );
};
export default TokenData;