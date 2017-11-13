CREATE USER vask WITH PASSWORD 'vask';
CREATE DATABASE vask_app lc_collate 'fi_FI.UTF-8' lc_ctype 'fi_FI.UTF-8' encoding 'UTF8' template template0;
GRANT ALL PRIVILEGES ON DATABASE vask_app to vask;
CREATE DATABASE vask_app_test lc_collate 'fi_FI.UTF-8' lc_ctype 'fi_FI.UTF-8' encoding 'UTF8' template template0;
GRANT ALL PRIVILEGES ON DATABASE vask_app_test to vask;
