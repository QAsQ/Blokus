./tools.py clear_db
./tools.py create_battle --accuracy_time 5 --additional_time 10
./tools.py add_user -p 0
./tools.py add_user -p 1
./tools.py add_user -p 2
./tools.py add_user -p 3
#watch -n 0.5 './tools.py get_one_battle'
while(true); do ./tools.py get_one_battle --debug;done
