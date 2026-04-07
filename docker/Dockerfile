FROM nginx:mainline-alpine
COPY static /usr/share/nginx/html
COPY portal.conf /etc/nginx/conf.d/
RUN rm /etc/nginx/conf.d/default.conf
