import {Dimensions} from 'react-native'
import { mediaDevices } from "react-native-webrtc";

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height

export default class Utils {

    static async getStream(){
        let isFront = true;
        const sourceInfos = await mediaDevices.enumerateDevices();

        console.log(sourceInfos,'...SOURCEINFOS FROM UTILS....\n\n');
        let videoSourceId;
        for (let i = 0; i<sourceInfos.length; i++){
            const sourceInfo = sourceInfos[i];
            if(sourceInfo.kind=='videoinput' && sourceInfo.facing ==(isFront?'front':'environment')) {
                videoSourceId = sourceInfo.deviceId;
            }
        }

        // const stream = await mediaDevices.getUserMedia({
        //     audio:true,
        //     video:{
        //         height: windowHeight,
        //         width: windowWidth,
        //         frameRate:30,
        //         facingMode: isFront?'front':'environment',
        //         deviceId:videoSourceId
        //     }
        // })

        if(typeof stream != 'boolean') return stream;
        return null;
    }



}