#!/bin/sh
docker exec -it popspace bash -c "yarn workspace @withso/file-upload build"
docker exec -it popspace bash -c "yarn workspace @withso/noodle-shared build"
docker exec -it popspace bash -c "yarn workspace @withso/unicorn build"
docker exec -it popspace bash -c "yarn workspace @withso/noodle-shared prisma:generate"
docker exec -it popspace bash -c "yarn workspace noodle-app build"
docker exec -it popspace bash -c "yarn workspace unicorn build"
docker exec -it popspace bash -c "cd ./noodle && yarn build"
docker restart popspace
