sudo apt-get install g++ curl;

git clone git://github.com/isaacs/npm.git;
cd npm/scripts;
sudo ./install.sh;

npm install n -g;
n 0.8.10;

npm install socket.io; #Find out how to compile native extensions
npm install underscore;