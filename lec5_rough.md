
#TOPIC 5
#PHYSICAL LAYER

-bit by bit encoding of information onto various transmission mediums


-CABLES AND WIRELESS

##CABLES
    -POINT TO POINT connection(connect exactly 2 devices)
    -dont have to excrypt data by default so have security by default but is optional
    -COPPER used
    -can acheive full duplex
    -exapmple mouse wire only need one sender so dont need full deplex, confirm though ?
    -copper or fibre


    ##COPPER
        -electrical cuurents use to encrypt info
        -effected by electromagnetic waves hence thunderstorms
        -called twisted pair- because when you cut open a cable you mught see (see notebook) and its done so to camncel the magnetic feild to prevent corruption and called pair because you ned always 2 of them



    ##FIBRE
        -encryts data by pulses of light hence fastest as they operatr on speed of light
        -fully enclosed glass tubes with mirror shielding so light cant escape
        - hence fibre comes TO my house not IN my house
        - no effect even by thunderstorms



DEVICES

HARDWARE DEVICES
    -CABLES-POOMT TO POINT
    -ANTENNA
    -NETWORK HUB

NETWORK HUB
  -act as a cable so can connect n devices
  -upon recievong the signal it dulplicates the signal out on all other ports
    - COLLISION domain put 2 signals onlto a single direction, cause the data to be currupted
    - soln to hub prob- CSMA(notes6)
    - CARRIER SENCE MULPTIPLE ACCESS
  version 1-
            function send(message){
            while (receiving data)
            {wait}
            os.write(message);
            }

   - this shows if you are receiving data, that means someone is sending hence until the data stops comming in form of electrival signals you wait to send your message hence they get degraded to act like half duplex which means 1 sender at a time
   - our mission is to minimize collision domains for that we did
   - csma + cd carrier sense multiple access + collsion detector- version 2

    function send(message,i=0){
            while (receiving data)
            {wait}
            os.write(message[i]); --we send the smallest chunk of the orignal message, hencw we send first chunk of message and then go up to see if anyone else is sending and if not sends the second chunk and continues howvwer if we see soemone else is sending we wait
            send(message, i+!) --after all the above cycle is over next person can now send their msg
            }




#WIRELESS
    -omni-directional
    -must be encryted
    -very lossy because it operates at half duplex but they operate on pico seconds so devices negotiate with each to wait for the time 1 device is sending a message hence VERY FAST half duplex


EXCELLENT IS >60% of msg sent is recieved

whats acknowledgement message?

physical propertoes of the transmission medium define the protocols


#CHANNEL TYPES

SIMPLEX
    -unidirectional


DUPLLEX
    -bidirectional
    half-duplex - 1 sender at a time 
    full duplex- both at same time




