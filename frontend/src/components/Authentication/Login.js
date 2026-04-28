import { Button, FormControl, FormLabel, Input, InputGroup, InputRightElement, VStack, useToast } from '@chakra-ui/react';
import React, { useState } from 'react';
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import { ChatState } from "../../Context/ChatProvider";

const Login = () => {
    const [show, setShow] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const toast = useToast();
    const history = useHistory();
    const { setUser } = ChatState();

    const handleClick = () => setShow(!show);

    const submitHandler = async () => {
        setLoading(true);
        if (!email || !password) {
            toast({
                title: "Please fill all the fields!",
                status: "warning",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });
            setLoading(false);
            return;
        }
        try {
            const config = {
                headers: {
                    "Content-Type": "application/json",
                },
            };

            const { data } = await axios.post(
                "/api/user/login",
                { email, password },
                config
            );

            toast({
                title: "Login successful",
                status: "success",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });

            localStorage.setItem("userInfo", JSON.stringify(data));
            setUser(data);
            setLoading(false);
            history.push("/chats");
        } catch (error) {
            toast({
                title: "Error occurred!",
                description: error.response?.data?.message || "Invalid credentials",
                //   why question marks given by gpt
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });
            setLoading(false);
        }
    };

    return (
        <VStack spacing={'5px'} color={'black'}>
            <FormControl id='loginemail' isRequired>
                <FormLabel>Email </FormLabel>
                <Input
                    placeholder='Enter your Email'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
            </FormControl>
            <FormControl id='loginpassword' isRequired>
                <FormLabel>Password</FormLabel>
                <InputGroup>
                    <Input
                        type={show ? 'text' : 'password'}
                        placeholder='Enter your password'
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <InputRightElement w={'4.5rem'}>
                        <Button h={'1.75rem'} size={'sm'} onClick={handleClick}>
                            {show ? "Hide" : "Show"}
                        </Button>
                    </InputRightElement>
                </InputGroup>
            </FormControl>
            <Button
                colorScheme='blue'
                w={'100%'}
                style={{ marginTop: 15 }}
                onClick={submitHandler}
                isLoading={loading}
            >
                Login
            </Button>
            <Button
                variant={'solid'}
                colorScheme='red'
                w={'100%'}
                style={{ marginTop: 15 }}
                onClick={() => {
                    setEmail("guest@example.com");
                    setPassword("12345");
                }}
            >
                Login as Guest
            </Button>
        </VStack>
    );
};

export default Login;
