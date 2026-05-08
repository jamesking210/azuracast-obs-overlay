FROM nginx:alpine

RUN apk add --no-cache gettext

COPY site/ /usr/share/nginx/html/
COPY nginx.conf.template /etc/nginx/templates/obs-overlay.conf.template
COPY docker-entrypoint.sh /docker-entrypoint.sh

RUN chmod +x /docker-entrypoint.sh

EXPOSE 80

ENTRYPOINT ["/docker-entrypoint.sh"]
