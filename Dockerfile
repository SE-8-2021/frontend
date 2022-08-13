FROM node:alpine

ARG WORKPLACE=/pvs-frontend

COPY ./ $WORKPLACE

WORKDIR $WORKPLACE

RUN npm i -g pnpm serve && \
    SHELL="/bin/bash" pnpm setup && \
    pnpm i --frozen-lockfile &&  \
    pnpm build

RUN mkdir ../to_rm && \
    mv ./* ../to_rm && \
    mv ../to_rm/dist ./ && \
    rm -rf ../to_rm

ENV NODE_ENV=production

CMD ["serve", "-s", "dist", "-C"]
