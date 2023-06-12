FROM node:14 as builder
RUN npm install -g @angular/cli
WORKDIR /home/quotes-collection-frontend
COPY package*.json ./
RUN npm install
COPY . .
COPY .env .
RUN npm run build

FROM nginx:1.19.0-alpine as production-stage
COPY --from=builder /home/quotes-collection-frontend/dist/quotes-collection-frontend /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
