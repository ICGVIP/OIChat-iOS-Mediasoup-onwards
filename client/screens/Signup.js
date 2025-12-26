import React,{useEffect, useState} from 'react';
import { StyleSheet,Text, SafeAreaView, View, Image, Dimensions, Linking, ScrollView,useColorScheme, TouchableOpacity} from 'react-native';
import { TextInput,MD3LightTheme as DefaultTheme ,Button } from 'react-native-paper';
import AntDesign from '@expo/vector-icons/AntDesign';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useDispatch, useSelector } from 'react-redux';
import { Toast } from '../context/ToastContext';
import RNPickerSelect from 'react-native-picker-select';
const windowWidth = Dimensions.get('window').width;
const imageWidth = windowWidth * 0.25;


const countryCodes = [
    { label: 'Afghanistan (+93)', value: '+93' },
    { label: 'Albania (+355)', value: '+355' },
    { label: 'Algeria (+213)', value: '+213' },
    { label: 'Angola (+244)', value: '+244' },
    { label: 'Antigua and Barbuda (+1 268)', value: '+1 268' },
    { label: 'Argentina (+54)', value: '+54' },
    { label: 'Armenia (+374)', value: '+374' },
    { label: 'Australia (+61)', value: '+61' },
    { label: 'Azerbaijan (+994)', value: '+994' },
    { label: 'Bahamas (+1 242)', value: '+1 242' },
    { label: 'Bahrain (+973)', value: '+973' },
    { label: 'Bangladesh (+880)', value: '+880' },
    { label: 'Barbados (+1 246)', value: '+1 246' },
    { label: 'Belize (+501)', value: '+501' },
    { label: 'Benin (+229)', value: '+229' },
    { label: 'Bhutan (+975)', value: '+975' },
    { label: 'Bolivia (+591)', value: '+591' },
    { label: 'Bosnia and Herzegovina (+387)', value: '+387' },
    { label: 'Botswana (+267)', value: '+267' },
    { label: 'Brazil (+55)', value: '+55' },
    { label: 'Brunei (+673)', value: '+673' },
    { label: 'Burkina Faso (+226)', value: '+226' },
    { label: 'Burundi (+257)', value: '+257' },
    { label: 'Cabo Verde (+238)', value: '+238' },
    { label: 'Cambodia (+855)', value: '+855' },
    { label: 'Cameroon (+237)', value: '+237' },
    { label: 'Central African Republic (+236)', value: '+236' },
    { label: 'Chad (+235)', value: '+235' },
    { label: 'Chile (+56)', value: '+56' },
    { label: 'China (+86)', value: '+86' },
    { label: 'Colombia (+57)', value: '+57' },
    { label: 'Comoros (+269)', value: '+269' },
    { label: 'Congo (+242)', value: '+242' },
    { label: 'Costa Rica (+506)', value: '+506' },
    { label: 'Cuba (+53)', value: '+53' },
    { label: 'Dominica (+1 767)', value: '+1 767' },
    { label: 'Dominican Republic (+1 809)', value: '+1 809' },
    { label: 'Ecuador (+593)', value: '+593' },
    { label: 'Egypt (+20)', value: '+20' },
    { label: 'El Salvador (+503)', value: '+503' },
    { label: 'Equatorial Guinea (+240)', value: '+240' },
    { label: 'Eritrea (+291)', value: '+291' },
    { label: 'Eswatini (+268)', value: '+268' },
    { label: 'Ethiopia (+251)', value: '+251' },
    { label: 'Fiji (+679)', value: '+679' },
    { label: 'Gabon (+241)', value: '+241' },
    { label: 'Gambia (+220)', value: '+220' },
    { label: 'Georgia (+995)', value: '+995' },
    { label: 'Ghana (+233)', value: '+233' },
    { label: 'Grenada (+1 473)', value: '+1 473' },
    { label: 'Guatemala (+502)', value: '+502' },
    { label: 'Guinea (+224)', value: '+224' },
    { label: 'Guinea-Bissau (+245)', value: '+245' },
    { label: 'Guyana (+592)', value: '+592' },
    { label: 'Haiti (+509)', value: '+509' },
    { label: 'Honduras (+504)', value: '+504' },
    { label: 'Iceland (+354)', value: '+354' },
    { label: 'India (+91)', value: '+91' },
    { label: 'Indonesia (+62)', value: '+62' },
    { label: 'Iran (+98)', value: '+98' },
    { label: 'Iraq (+964)', value: '+964' },
    { label: 'Israel (+972)', value: '+972' },
    { label: 'Jamaica (+1 876)', value: '+1 876' },
    { label: 'Japan (+81)', value: '+81' },
    { label: 'Jordan (+962)', value: '+962' },
    { label: 'Kazakhstan (+7)', value: '+7' },
    { label: 'Kenya (+254)', value: '+254' },
    { label: 'Kiribati (+686)', value: '+686' },
    { label: 'Kuwait (+965)', value: '+965' },
    { label: 'Kyrgyzstan (+996)', value: '+996' },
    { label: 'Laos (+856)', value: '+856' },
    { label: 'Lebanon (+961)', value: '+961' },
    { label: 'Lesotho (+266)', value: '+266' },
    { label: 'Liberia (+231)', value: '+231' },
    { label: 'Libya (+218)', value: '+218' },
    { label: 'Liechtenstein (+423)', value: '+423' },
    { label: 'Lithuania (+370)', value: '+370' },
    { label: 'Luxembourg (+352)', value: '+352' },
    { label: 'Madagascar (+261)', value: '+261' },
    { label: 'Malawi (+265)', value: '+265' },
    { label: 'Malaysia (+60)', value: '+60' },
    { label: 'Maldives (+960)', value: '+960' },
    { label: 'Mali (+223)', value: '+223' },
    { label: 'Mauritania (+222)', value: '+222' },
    { label: 'Mauritius (+230)', value: '+230' },
    { label: 'Mexico (+52)', value: '+52' },
    { label: 'Micronesia (+691)', value: '+691' },
    { label: 'Moldova (+373)', value: '+373' },
    { label: 'Monaco (+377)', value: '+377' },
    { label: 'Mongolia (+976)', value: '+976' },
    { label: 'Montenegro (+382)', value: '+382' },
    { label: 'Morocco (+212)', value: '+212' },
    { label: 'Mozambique (+258)', value: '+258' },
    { label: 'Myanmar (+95)', value: '+95' },
    { label: 'Namibia (+264)', value: '+264' },
    { label: 'Nauru (+674)', value: '+674' },
    { label: 'Nepal (+977)', value: '+977' },
    { label: 'Nicaragua (+505)', value: '+505' },
    { label: 'Niger (+227)', value: '+227' },
    { label: 'Nigeria (+234)', value: '+234' },
    { label: 'North Macedonia (+389)', value: '+389' },
    { label: 'Norway (+47)', value: '+47' },
    { label: 'Oman (+968)', value: '+968' },
    { label: 'Pakistan (+92)', value: '+92' },
    { label: 'Palau (+680)', value: '+680' },
    { label: 'Panama (+507)', value: '+507' },
    { label: 'Papua New Guinea (+675)', value: '+675' },
    { label: 'Paraguay (+595)', value: '+595' },
    { label: 'Peru (+51)', value: '+51' },
    { label: 'Philippines (+63)', value: '+63' },
    { label: 'Qatar (+974)', value: '+974' },
    { label: 'Romania (+40)', value: '+40' },
    { label: 'Russia (+7)', value: '+7' },
    { label: 'Rwanda (+250)', value: '+250' },
    { label: 'Saint Kitts and Nevis (+1 869)', value: '+1 869' },
    { label: 'Saint Lucia (+1 758)', value: '+1 758' },
    { label: 'Saint Vincent and the Grenadines (+1 784)', value: '+1 784' },
    { label: 'Samoa (+685)', value: '+685' },
    { label: 'San Marino (+378)', value: '+378' },
    { label: 'Sao Tome and Principe (+239)', value: '+239' },
    { label: 'Saudi Arabia (+966)', value: '+966' },
    { label: 'Senegal (+221)', value: '+221' },
    { label: 'Serbia (+381)', value: '+381' },
    { label: 'Seychelles (+248)', value: '+248' },
    { label: 'Sierra Leone (+232)', value: '+232' },
    { label: 'Singapore (+65)', value: '+65' },
    { label: 'Solomon Islands (+677)', value: '+677' },
    { label: 'Somalia (+252)', value: '+252' },
    { label: 'South Africa (+27)', value: '+27' },
    { label: 'South Sudan (+211)', value: '+211' },
    { label: 'Sri Lanka (+94)', value: '+94' },
    { label: 'Sudan (+249)', value: '+249' },
    { label: 'Suriname (+597)', value: '+597' },
    { label: 'Syria (+963)', value: '+963' },
    { label: 'Taiwan (+886)', value: '+886' },
    { label: 'Tajikistan (+992)', value: '+992' },
    { label: 'Tanzania (+255)', value: '+255' },
    { label: 'Thailand (+66)', value: '+66' },
    { label: 'Togo (+228)', value: '+228' },
    { label: 'Tonga (+676)', value: '+676' },
    { label: 'Trinidad and Tobago (+1 868)', value: '+1 868' },
    { label: 'Tunisia (+216)', value: '+216' },
    { label: 'Turkey (+90)', value: '+90' },
    { label: 'Turkmenistan (+993)', value: '+993' },
    { label: 'Tuvalu (+688)', value: '+688' },
    { label: 'Uganda (+256)', value: '+256' },
    { label: 'Ukraine (+380)', value: '+380' },
    { label: 'United Arab Emirates (+971)', value: '+971' },
    { label: 'United States/Canada (+1)', value: '+1' },
    { label: 'Uruguay (+598)', value: '+598' },
    { label: 'Uzbekistan (+998)', value: '+998' },
    { label: 'Vanuatu (+678)', value: '+678' },
    { label: 'Vatican City (+379)', value: '+379' },
    { label: 'Venezuela (+58)', value: '+58' },
    { label: 'Vietnam (+84)', value: '+84' },
    { label: 'Yemen (+967)', value: '+967' },
    { label: 'Zambia (+260)', value: '+260' },
    { label: 'Zimbabwe (+263)', value: '+263' },
];
  
  
const SignUp = ({navigation}) => {

    const [show, setShow] = useState(false);
    const [countryCode, setCountryCode] = useState(null);
    let [fname,setFName] = useState('');
    let [lname,setLName] = useState('');
    let [email,setEmail] = useState('');
    let [password,setPWD] = useState('');
    const [confirmPassword, setConfirmPWD] = useState('');
    const [isPasswordValid, setIsPasswordValid] = useState(true);
    const [passwordError, setPasswordError] = useState('');
    const [passwordMatchError, setPasswordMatchError] = useState('');
    let [phone,setPhone] = useState('');
    let [loading,setLoading] = useState(false);
    let [secureTextEntryPW,setSecureTextEntryPW] = useState(true);
    let [secureTextEntryCPW,setSecureTextEntryCPW] = useState(true);
    let [heightContainer, setHeight] = useState(48);
    let dispatch = useDispatch();
    let user = useSelector(state=>state.user.value);
    let colorScheme = useColorScheme();

    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[\/?;:<>!@#$%^&*()\-_+=\[\]{}|\\,.\'"`~])[A-Za-z\d\/?;:<>!@#$%^&*()\-_+=\[\]{}|\\,.\'"`~]{7,}$/


    useEffect(()=>{
        if(user.data){
            navigation.navigate('Money Transfer')
        }
    },[user])

    function handleURLPP(){
        Linking.openURL('https://oichat.com/privacy')
    }

    function handleURLLicense(){
        Linking.openURL('https://oichat.com/license')
    }

    const handleLayout = (event) => {
        const { height } = event.nativeEvent.layout;
        console.log(height,'..pra..\n')
        setHeight(height); // Get the height of the TextInput
    };

    async function handleSubmit(e){
        e.preventDefault()
        var validRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,3}$/;
        if(!phone||!phone.match(/^\d{10}$/)){
            return Toast.show("❌   Invalid phone number", {
                duration: Toast.durations.LONG,
                position: -60,
                shadow: true,
                animation: true,
                hideOnPress: true,
                backgroundColor:'rgb(11,11,11)',
            })
        }
        if(!email || !email.match(validRegex)){
            return Toast.show("❌   Invalid email", {
                duration: Toast.durations.LONG,
                position: -60,
                shadow: true,
                animation: true,
                hideOnPress: true,
                backgroundColor:'rgb(11,11,11)',
            })
        }
        
        if(!password||!countryCode||!fname||!lname){
            return Toast.show("💡   Please complete all fields", {
                duration: Toast.durations.LONG,
                position: -60,
                shadow: true,
                animation: true,
                hideOnPress: true,
                backgroundColor:'rgb(11,11,11)',
            })
        }
        if( !passwordRegex.test(password)){
            return Toast.show("💡   Please ensure your password is of minimum 7 characters with atleast 1 number, uppercase letter and symbol", {
                duration: Toast.durations.LONG,
                position: -60,
                shadow: true,
                animation: true,
                hideOnPress: true,
                backgroundColor:'rgb(11,11,11)',
            })
        }
        // Check if password and confirm password match
        if (password !== confirmPassword) {
            setPasswordMatchError("Passwords do not match.");
            return;
        } 
        setLoading(true)
        try{
            let reply = await fetch('http://216.126.78.3:4500/signup',{
                method:'POST',
                headers:{
                    'Content-type':'application/json'
                },
                body:JSON.stringify({firstName: fname, lastName: lname,email,password,phone, countryCode})
            });

            let response = await reply.json();

            setLoading(false)
            if(response.detail){
                console.log(response.detail,'...murshid ke shehar mein...\n\n')
                return Toast.show('kuchh hus....', {
                    duration: Toast.durations.LONG,
                    position: -60,
                    shadow: true,
                    animation: true,
                    hideOnPress: true,
                    backgroundColor:'rgb(11,11,11)',
                  })
            }
            navigation.push('Verify',{phone:response.phone})
            console.log('User registration done')
        }catch(err){
            setLoading(false)
            console.log(err,'dfjhvbfdhvbfd')
        }
        
    }

    // Function to handle confirm password matching
    const handleConfirmPasswordChange = (value) => {
        setConfirmPWD(value);

        // Check if passwords match
        if (value !== password) {
        setPasswordMatchError("Passwords do not match");
        } else {
        setPasswordMatchError('');
        }
    };
  
    return (
        <SafeAreaView style={colorScheme=='light'?styles.container:styles.container_dark}>

            <ScrollView automaticallyAdjustKeyboardInsets>
                <View style={styles.header}>
                    <TouchableOpacity  onPress={()=>navigation.goBack()} ><AntDesign name="left" size={24} color={colorScheme=='light'?'black':'rgb(20,130,199)'}/></TouchableOpacity>
                    <Image resizeMode="contain" source={{uri:'https://oichat.s3.us-east-2.amazonaws.com/assets/OI.png'}} style={styles.image}></Image>
                    <TouchableOpacity  onPress={()=>navigation.navigate('Login')}><Text style={styles.signUp}>Log In</Text></TouchableOpacity>
                </View>
            
                <View style={styles.body1}>
                    <View style={{width:'100%',flexDirection:'row',marginVertical:15,justifyContent:'space-between'}}>
                        <View style={{width:'27%', height:heightContainer+2}}>
                            <RNPickerSelect
                            onValueChange={(value) => setCountryCode(value)} // Handle value change
                            items={countryCodes} // Provide country codes to the picker
                            placeholder={{label:'Country Code', value:null}}
                            value={countryCode} // Set the selected value
                            style={{
                                inputIOS: {
                                width: '100%',
                                height:'100%',
                                backgroundColor: colorScheme == 'light' ? 'white' : 'rgb(63,68,80)',
                                borderRadius: 4,
                                marginTop:6.5,
                                color: colorScheme == 'light' ? 'black' : 'white',
                                paddingHorizontal:10,
                                borderColor:colorScheme == 'light' ?'rgba(0,0,0,0.5)':'rgba(255, 255, 255, 0.3)',
                                borderWidth:1,
                                placeholderColor:'black'
                                },
                                inputAndroid: {
                                width: '27%',
                                backgroundColor: colorScheme == 'light' ? 'white' : 'rgb(63,68,80)',
                                paddingHorizontal: 10,
                                borderRadius: 4,
                                color: colorScheme == 'light' ? 'black' : 'white',
                                },
                                inputIOSContainer:{
                                pointerEvents: "none",
                                height:'100%'
                                },
                                placeholder:{
                                color:colorScheme=='light'?'black':'#BDBDBD'
                                }
                            }}
                            darkTheme={colorScheme=='dark'}
                            />
                        </View>


                        <TextInput
                            mode="outlined"
                            label="Phone"
                            style={colorScheme=='light'?{width:'67%',backgroundColor:'white'}:{width:'67%',backgroundColor:'rgb(63,68,80)'}}
                            onChangeText={(e)=>setPhone(e)}
                            keyboardType='numeric'
                            onLayout={handleLayout}
                        />
                    </View>
            
                    <TextInput
                        mode="outlined"
                        label="First Name"
                        style={colorScheme=='light'?{backgroundColor:'white',marginVertical:15}:{backgroundColor:'rgb(63,68,80)',marginVertical:15}}
                        onChangeText={(e)=>setFName(e)}
                    ></TextInput>

                    <TextInput
                        mode="outlined"
                        label="Last Name"
                        style={colorScheme=='light'?{backgroundColor:'white',marginVertical:15}:{backgroundColor:'rgb(63,68,80)',marginVertical:15}}
                        onChangeText={(e)=>setLName(e)}
                    ></TextInput>
            
                    <TextInput
                        mode="outlined"
                        label="Email"
                        style={colorScheme=='light'?{backgroundColor:'white',marginVertical:15}:{backgroundColor:'rgb(63,68,80)',marginVertical:15}}
                        onChangeText={(e)=>setEmail(e)}
                    ></TextInput>
                    <TextInput
                        mode="outlined"
                        label="Password"
                        style={[
                            colorScheme == 'light' ? { backgroundColor: 'white', marginVertical: 15 } : { backgroundColor: 'rgb(63,68,80)', marginVertical: 15 }
                        ]}
                        activeOutlineColor={!isPasswordValid?'red':''}
                        secureTextEntry={secureTextEntryPW}
                        right={
                            <TextInput.Icon
                                icon={() => <Ionicons name={secureTextEntryPW ? "eye-off-outline" : "eye-outline"} size={24} color={colorScheme == 'light' ? 'black' : 'grey'} />}
                                onPress={() => setSecureTextEntryPW(!secureTextEntryPW)}
                            />
                        }
                        onChangeText={(e) => {
                            setPWD(e);
                            // Check if the password is valid
                            if (passwordRegex.test(e)) {
                                setIsPasswordValid(true);
                                setPasswordError('');
                            } else {
                                setIsPasswordValid(false);
                                setPasswordError(`Password must be at least 7 characters, include one number, one uppercase letter, and one special character. (Note: . , ' " and backtick are not considered special characters.)`);
                            }
                        }}
                    />

                    {!isPasswordValid && passwordError && (
                        <Text style={{ color: 'red', marginTop: 5, fontSize: 12 }}>{passwordError}</Text>
                    )}

                    {/* Confirm Password input */}
                    <TextInput
                        mode="outlined"
                        label="Confirm Password"
                        style={[
                        colorScheme === 'light' ? { backgroundColor: 'white', marginVertical: 15 } : { backgroundColor: 'rgb(63,68,80)', marginVertical: 15 }
                        ]}
                        activeOutlineColor={passwordMatchError?'red':''}
                        secureTextEntry={secureTextEntryCPW}
                        right={
                            <TextInput.Icon
                                icon={() => <Ionicons name={secureTextEntryCPW ? "eye-off-outline" : "eye-outline"} size={24} color={colorScheme == 'light' ? 'black' : 'grey'} />}
                                onPress={() => setSecureTextEntryCPW(!secureTextEntryCPW)}
                            />
                        }
                        onChangeText={handleConfirmPasswordChange}
                    />

                    {/* Confirm Password Error */}
                    {passwordMatchError && <Text style={{ color: 'red', fontSize: 12, marginTop: 5 }}>{passwordMatchError}</Text>}
                    
                </View>

                <View style={styles.body2}>
                    <Text style={colorScheme=='light'?{color:'black'}:{color:'white'}}>By signing up, you agree to our <Text onPress={handleURLPP} style={styles.important}>Privacy Policy</Text> and <Text onPress={handleURLLicense} style={styles.important}>License Agreement</Text></Text>
                    <Button disabled={loading} compact buttonColor='rgb(233,88,36)' textColor='white' mode="contained" onPress={handleSubmit} style={{width:'50%',marginVertical:15}}>
                        Sign up
                    </Button>
                </View>
            </ScrollView>
            
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container:{
        flex:1,
        backgroundColor:'white'
    },
    container_dark:{
        flex:1,
        backgroundColor:'rgb(33,38,51)'
    },
    image:{
      width:imageWidth,
      alignItems:'center',
      justifyContent:'center',
      height:imageWidth
    },
    header:{
      flexDirection:'row',
      justifyContent:'space-between',
      paddingHorizontal:15,
      alignItems:'center'
    },
    signUp:{
      fontSize:17,
      fontWeight:'bold',
      color:'rgb(20,130,199)'
    },
    body1:{
      flex:1,
      paddingHorizontal:15,
      justifyContent:'center',
      marginVertical:15
    },
    body2:{
      flex:1,
      paddingHorizontal:15,
      justifyContent:'flex-start',
      alignItems:'center',
      marginVertical:15
    },
    important:{
        color:'rgb(233,88,36)'
      }
})
export default SignUp;