##Trasnnsport lay
ensures data is connectde to correct appln
UDP Datagram header format

port #- used to differtiate diff applns ie server and client

a client application is defined by sending the first request
the server appln is waiting for the initial req

Servers will bind to a developer requested port


server.listen(35555, () => console.log('server bound')); server requests on port 3555
clients will req to communicate on that port

binding to port means youre asking the opperating system to forward any messages recieved with that {destination port} to be forwarded to your current application



##TYPES OF PORT
    0-1023 'Well known ports'
        - reserved for established protocols and generally cannt be used unles you are building a server client that speaks that protocol eg port 80 is reserved for HTTP
        - provides support for default values. 
    1024-49151 -Registered ports 
        - we can use these
        - be aware of what other applications your tyoical user will also be using eg MySQL 3306
    49152-65535 'most imp - Ephemeral Ports'
        - reserved by the os to provide support for client appln

As a developer you only choose the destn ip and port, The os chooses the source port from epphemeral range. Why?


NAT
        - a beautiful hack solution to the IPv4 exhaustion problem
        - what is ipv4 exhaustion probem? network layer should have this
        - uses the combination of port # and local ip addresses to add a few bits of info enough to differtiate btw A and B


how to get past ip bans
    - unplug the internet for a day or so depending on your isp provider, the isp takes your ip away since youre inactive and then when you come back isp gives you a new ip address and there ya go






#TCP AND UDP
    ##TCP 
        - reliable delivery meaning will continuosly attemp to deliver your msg until we decide to give up
        - no out of order messages
          - TEAM-> the order could change and gets sent MEAT but tcp reorders these msgs back to orignal meaning
        - no duplicate messages
          - TO->(TOO) could be sent like this but tcp detects duplications and put them back to 
          (TO)
        - congestion control 
          - if thousand of peopple are on server and were running out of resources we can send a backoff mechanism that says hey ....explaiN
        - complex protocol 
        - we need to differtiate btw diff types of messages 
          - data segments, ack segments, syn segments
        - bundled category
        - #SEQUENCE NUMBERS- 
          - a measure of hoe much 'data' was sent by 1 party. upon connecting both parties initialise sequence# to 1. for each byte of data is sent, seq# is increased. each party mantains their own independent set of seq# and ack#s. seq# do not increase for nondata segments or headers
          - next seq #= prev seq # + prev data.length()
          - seq # do not gurantee reliable delivery but msgs are always in order as the seq number alwasys change if there was a msg sent before it, look at textbook. if seq 101 goes first they know there has to be a seq# that has 1 befire so it waits
          - make sure no dulicate msgs, as seq number always change acc to the formula so if two msgs w same seq msgs go it would be flagged as duplicate and be thrown out
    - #Acknowdlgement msgs
          - increased when recieving data in the CORRECT order
          - when transmitting they are only important for messages of type acknowldgement [ACKFLAG=1]
          - 1) next expeceted seq#
          - 2)number of bytes succesfully recieved in the correct order. these are two defn for ack msgs and both are coorrect
          - who controls in header that how many msgs is sent before ack msg needs to be sent








     ##UDP
        - NO GURANTEES
        - "BEST EFFORT" Delivery protocls
        - provides benefits TCP doesnt like
          - speed, low latency, and simplicity are more important than guaranteed reliability.
        - simple data + protocol that is you take the msg you wrap udp header on top of it and put it on netwrok layer
        - one type of msg ie udp msg






    
