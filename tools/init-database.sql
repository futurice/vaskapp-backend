CREATE USER wappu WITH PASSWORD 'wappu';
CREATE DATABASE wappuapp lc_collate 'fi_FI.UTF-8' lc_ctype 'fi_FI.UTF-8' encoding 'UTF8' template template0;
GRANT ALL PRIVILEGES ON DATABASE wappuapp to wappu;
CREATE DATABASE wappuapp_test lc_collate 'fi_FI.UTF-8' lc_ctype 'fi_FI.UTF-8' encoding 'UTF8' template template0;
GRANT ALL PRIVILEGES ON DATABASE wappuapp_test to wappu;
