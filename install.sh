#!/bin/bash
install_loc="/bin"
config_loc="/etc/observer"

# TODO: Take install_loc & config_loc as parameters
if [ "$EUID" -ne 0 ]
  then echo "FAILED! Not root. Please run installer as root."
  exit
fi
echo "Creating a config directory to $config_loc\n"
mkdir $config_loc

if [ ! -f $config_loc/obs.conf ]; then
    echo "Creating a config file to $config_loc/obs.conf\n"
    #rm "$config_loc/obs.conf"
    touch "$config_loc/obs.conf"
    echo "# Server IP address or domain
    SERVER 127.0.0.1
    # Server port
    PORT 6152
    # Unique Key location
    KEY /etc/observer/" >> "$config_loc/obs.conf"
fi


echo "Configuration file is saved at $config_loc/obs.conf\n"
echo "Building observer-client executable..."
touch "$config_loc/.obsc_conf"
chmod 666 "$config_loc/.obsc_conf"

cd observer-client
make
echo "Copying executable to $install_loc/observer-client"
cp bin/observer-client "$install_loc/observer-client"
echo "Installation done.\n\n"
