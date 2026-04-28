import { Box, Container, Text, Tabs, Tab, TabList, TabPanels, TabPanel } from '@chakra-ui/react'
import React, { useEffect } from 'react'
import Login from '../components/Authentication/Login';
import Signup from '../components/Authentication/Signup';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';
const Home = () => {
    const history = useHistory();
    useEffect(() => {
        const user = JSON.parse(localStorage.getItem("userInfo"));
        if (user) history.push("/chats");
    }, [history]);




    return (
        <Container maxW='xl' centerContent >
            <Box
                d='flex'
                justifyitem={'center'}
                p={2}
                bg={'white'}
                width={'100% '}
                m="40px 0 15px 0"
                borderRadius={'lg'}
                borderWidth={'1px'}
            >
                <Text fontSize={'4xl'} fontFamily={'work sans'} align={'center'} color='b'>Chat App</Text>
            </Box>

            <Box bg={'white'} w={'100%'} p={4} borderRadius={'lg'} borderWidth={'2px'}>
                <Tabs variant='soft-rounded' colorScheme='green'>
                    <TabList mb={'1em'}>
                        <Tab w={'50%'}>Login</Tab>
                        <Tab w={'50%'}>Sign Up</Tab>
                    </TabList>
                    <TabPanels>
                        <TabPanel>
                            <Login />
                        </TabPanel>
                        <TabPanel>
                            <Signup />
                        </TabPanel>
                    </TabPanels>
                </Tabs>


            </Box>
        </Container>
    )
}

export default Home
