import { Text, Button, Box, Tooltip, Menu, MenuButton, MenuList, Avatar, MenuItem, MenuDivider, Drawer, useDisclosure, DrawerOverlay, DrawerHeader, DrawerContent, DrawerBody, Input, useToast, Spinner } from '@chakra-ui/react';
import { BellIcon, ChevronDownIcon } from '@chakra-ui/icons';
import React, { useState } from 'react';
import { ChatState } from '../../Context/ChatProvider';
import ProfileModal from './ProfileModal';
import { useHistory } from 'react-router-dom/cjs/react-router-dom';
import axios from 'axios';
import ChatLoading from '../ChatLoading';
import UserListItem from '../UserAvatar/UserListItem';
import { getSender } from '../../config/ChatLogics';
import NotificationBadge from "react-notification-badge";
import { Effect } from "react-notification-badge";

const SlideDrawer = () => {
    const [search, setSearch] = useState("");
    const [searchResult, setSearchResult] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingChat, setLoadingChat] = useState(false);
    const {
        setSelectedChat,
        user,
        notification,
        setNotification,
        chats,
        setChats,
    } = ChatState(); // Fix: Destructure user from ChatState
    const history = useHistory();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const toast = useToast();

    const logoutHandler = () => {
        localStorage.removeItem('userInfo');
        history.push("/");
    };
    const handleSearch = async () => {
        if (!search) {
            toast({
                title: "Please provide input to search",
                status: "warning",
                duration: 5000,
                isClosable: true,
                position: 'top-left',
            });
            return;
        }

        try {
            setLoading(true);  // Set loading to true when the search starts
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };
            const { data } = await axios.get(`/api/user?search=${search}`, config);
            // setLoading(false)
            setSearchResult(data);
        } catch (error) {
            console.error("Search request failed:", error.response ? error.response.data : error.message);
            toast({
                title: "Error Occurred",
                description: error.response ? error.response.data.message : "Failed to load the search results",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: 'bottom-left',
            });
        } finally {
            setLoading(false);  // Ensure loading is set to false after search completes
        }
    };
    const accessChat = async (userId) => {
        try {
            setLoadingChat(true);
            const config = {
                headers: {
                    "Content-type": "application/json",
                    Authorization: `Bearer ${user.token}`, // Ensure space after Bearer
                },
            };
            // console.log("Making request to /api/chats with userId:", userId);
            const { data } = await axios.post("/api/chats", { userId }, config);
            if (!chats.find((c) => c._id === data._id)) setChats([data, ...chats]);
            setSelectedChat(data);
            setLoadingChat(false);
            onClose(); // Ensure correct spelling
        } catch (error) {
            console.error("Error fetching chat:", error.response ? error.response.data : error.message);
            toast({
                title: "Error fetching Chat",
                description: error.response ? error.response.data.message : error.message,
                status: "error",
                duration: 5000,
                isClosable: true,
                position: 'bottom-left',
            });
        }
    };

    return (
        <>
            <Box
                display="flex" justifyContent="space-between" alignItems="center"
                bg="white" w="100%" p="5px 10px" borderWidth="5px"
            >
                <Tooltip label="Search users to chat" hasArrow placement="bottom-end">
                    <Button variant="ghost" onClick={onOpen}>
                        <i className="fas fa-search"></i> {/* Font Awesome search icon */}
                        <Text display={{ base: "none", md: "flex" }} px="4">
                            Search User
                        </Text>
                    </Button>
                </Tooltip>

                <Text fontSize="3xl" fontFamily={"Work sans"} fontWeight={'bold'}>
                    instant-chat
                </Text>
                <div>
                    <Menu>
                        <MenuButton p={1}>
                            <NotificationBadge
                                count={notification.length}
                                effect={Effect.SCALE} />
                            <BellIcon fontSize="2xl" m={1} />
                        </MenuButton>
                        <MenuList pl={2}>
                            {!notification.length && "No New Messages"}
                            {notification.map((notif) => (
                                <MenuItem
                                    key={notif._id}
                                    onClick={() => {
                                        setSelectedChat(notif.chat);
                                        setNotification(notification.filter((n) => n !== notif));
                                    }}
                                >
                                    {notif.chat.isGroupChat
                                        ? `New Message in ${notif.chat.chatName}`
                                        : `New Message from ${getSender(user, notif.chat.users)}`}
                                </MenuItem>
                            ))}
                        </MenuList>
                    </Menu>
                    <Menu>
                        <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
                            <Avatar
                                size='sm'
                                cursor={'pointer'}
                                name={user.name}
                                src={user.pic}
                            />
                        </MenuButton>

                        <MenuList>
                            <ProfileModal user={user}>
                                <MenuItem>My Profile</MenuItem>
                            </ProfileModal>
                            <MenuDivider />
                            <MenuItem onClick={logoutHandler}>Logout</MenuItem>
                        </MenuList>
                    </Menu>
                </div>
            </Box>

            <Drawer
                placement='left'
                isOpen={isOpen}
                onClose={onClose}
            >
                <DrawerOverlay />
                <DrawerContent>
                    <DrawerHeader borderBottomWidth={'1px'}>Search Users</DrawerHeader>
                    <DrawerBody>
                        <Box display="flex" pb={2}>
                            <Input
                                placeholder='Search by name or Email' mr={2}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                            <Button onClick={handleSearch}>
                                Go
                            </Button>
                        </Box>
                        {loading ? (
                            <ChatLoading />  // Ensure this component shows a loading indicator
                        ) : (
                            searchResult?.map((user) => (
                                <UserListItem
                                    key={user._id}
                                    user={user}
                                    handleFunction={() => accessChat(user._id)}
                                />
                            ))
                        )}
                        {loadingChat && <Spinner ml={'auto'} display={'flex'} />}
                    </DrawerBody>
                </DrawerContent>
            </Drawer>
        </>
    );
};

export default SlideDrawer;

