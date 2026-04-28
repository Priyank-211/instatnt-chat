import React, { useState } from 'react';
import { Button, IconButton, Image, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Text, useDisclosure, Input, useToast, VStack } from '@chakra-ui/react';
import { ViewIcon } from '@chakra-ui/icons';
import { ChatState } from '../../Context/ChatProvider';
import axios from 'axios';

const ProfileModal = ({ user, children }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { user: loggedUser, setUser } = ChatState() || {};
  const toast = useToast();
  
  const [pic, setPic] = useState("");
  const [picLoading, setPicLoading] = useState(false);

  // Check if the profile being viewed is the currently logged in user
  const isMe = loggedUser && user && user._id === loggedUser._id;

  const postDetails = (pics) => {
    setPicLoading(true);
    if (pics === undefined) {
      toast({ title: "Please Select an Image!", status: "warning", duration: 5000, isClosable: true, position: "bottom" });
      setPicLoading(false);
      return;
    }
    if (pics.type === "image/jpeg" || pics.type === "image/png" || pics.type === "image/jpg") {
      const data = new FormData();
      data.append("file", pics);
      data.append("upload_preset", "chat-app");
      data.append("cloud_name", "dnficw63h");
      fetch("https://api.cloudinary.com/v1_1/dnficw63h/image/upload", {
        method: "post",
        body: data,
      }).then((res) => res.json())
        .then(data => {
          setPic(data.url.toString());
          setPicLoading(false);
        })
        .catch((err) => {
          console.log(err);
          setPicLoading(false);
        });
    } else {
      toast({ title: "Please Select an Image!", status: "warning", duration: 5000, isClosable: true, position: "bottom" });
      setPicLoading(false);
    }
  };

  const updateProfilePic = async () => {
    if (!pic) return;
    try {
      setPicLoading(true);
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${loggedUser.token}`,
        },
      };
      const { data } = await axios.put("/api/user/updatepic", { pic }, config);
      setUser(data);
      localStorage.setItem("userInfo", JSON.stringify(data));
      toast({ title: "Profile Picture Updated!", status: "success", duration: 5000, isClosable: true, position: "bottom" });
      setPicLoading(false);
      setPic(""); // reset
      onClose();
    } catch (error) {
      toast({ title: "Error Occurred!", description: error.message, status: "error", duration: 5000, isClosable: true, position: "bottom" });
      setPicLoading(false);
    }
  };

  return (
    <>
      {children ? (
        <span onClick={onOpen} style={{ cursor: 'pointer' }}>{children}</span>
      ) : (
        <IconButton display={{ base: "flex" }} icon={<ViewIcon />} onClick={onOpen} />
      )}
      <Modal size='lg' isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent h='480px'>
          <ModalHeader
            fontSize={'40px'}
            fontFamily={'Work sans'}
            display='flex'
            justifyContent={'center'}
          >
            {user.name}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody
            display='flex'
            flexDirection={'column'}
            alignItems={'center'}
            justifyContent={'space-between'}
          >
            <Image
              borderRadius={'full'}
              boxSize={'150px'}
              src={pic || user.pic} 
              alt={user.name}
              mb={4}
            />
            {isMe && (
               <VStack mb={2}>
                 <Input type="file" p={1.5} accept="image/*" onChange={(e) => postDetails(e.target.files[0])} border="none" w="250px" />
                 {pic && (
                   <Button onClick={updateProfilePic} isLoading={picLoading} colorScheme="blue" size="sm">
                     Save New Picture
                   </Button>
                 )}
               </VStack>
            )}
            <Text
              fontSize={{ base: '28px', md: '30px' }}
              fontFamily={"Work sans"}
            >
              Email: {user.email}
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme='blue' mr={3} onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default ProfileModal;
