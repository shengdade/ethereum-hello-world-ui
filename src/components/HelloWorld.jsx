import React, { useEffect, useState } from "react";
import { Button, Card, Grid, Input, Message } from "semantic-ui-react";
import styled from "styled-components";
import {
  connectWallet,
  getCurrentWalletConnected,
  helloWorldContract,
  loadCurrentMessage,
  updateMessage,
} from "../util/interact.js";

const HelloWorld = () => {
  //state variables
  const [walletAddress, setWallet] = useState("");
  const [status, setStatus] = useState("");
  const [message, setMessage] = useState("No connection to the network."); //default message
  const [newMessage, setNewMessage] = useState("");

  //called only once
  useEffect(() => {
    async function loadOnce() {
      const message = await loadCurrentMessage();
      setMessage(message);
      addSmartContractListener();

      const { address, status } = await getCurrentWalletConnected();

      setWallet(address);
      setStatus(status);

      addWalletListener();
    }
    loadOnce();
  }, []);

  function addSmartContractListener() {
    helloWorldContract.events.UpdatedMessages({}, (error, data) => {
      if (error) {
        setStatus("😥 " + error.message);
      } else {
        setMessage(data.returnValues[1]);
        setNewMessage("");
        setStatus("🎉 Your message has been updated!");
      }
    });
  }

  function addWalletListener() {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts) => {
        if (accounts.length > 0) {
          setWallet(accounts[0]);
          setStatus("👆🏽 Write a message in the text-field above.");
        } else {
          setWallet("");
          setStatus("🦊 Connect to Metamask using the top right button.");
        }
      });
    } else {
      setStatus(
        <p>
          {" "}
          🦊{" "}
          <a
            target="_blank"
            href={`https://metamask.io/download.html`}
            rel="noreferrer"
          >
            You must install Metamask, a virtual Ethereum wallet, in your
            browser.
          </a>
        </p>
      );
    }
  }

  const connectWalletPressed = async () => {
    const walletResponse = await connectWallet();
    setStatus(walletResponse.status);
    setWallet(walletResponse.address);
  };

  const onUpdatePressed = async () => {
    const { status } = await updateMessage(walletAddress, newMessage);
    setStatus(status);
  };

  return (
    <Wrapper>
      <Grid>
        <Grid.Row centered>
          <Grid.Column width={8}>
            <Button onClick={connectWalletPressed}>
              {walletAddress.length > 0 ? (
                "Connected: " +
                String(walletAddress).substring(0, 6) +
                "..." +
                String(walletAddress).substring(38)
              ) : (
                <span>Connect Wallet</span>
              )}
            </Button>

            <StyledCard fluid>
              <Card.Content>
                <Card.Header>Message</Card.Header>
                <Card.Description>{message}</Card.Description>
              </Card.Content>
            </StyledCard>

            <Input
              fluid
              type="text"
              placeholder="Update the message in your smart contract."
              onChange={(e) => setNewMessage(e.target.value)}
              value={newMessage}
              action={
                <Button id="publish" onClick={onUpdatePressed}>
                  Update
                </Button>
              }
            />

            <Message>{status}</Message>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  margin-top: 4rem;
`;

const StyledCard = styled(Card)`
  word-break: break-all;
`;

export default HelloWorld;
