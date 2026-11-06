FROM node:22-bookworm-slim AS base

ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH

RUN corepack enable

WORKDIR /app

FROM base AS dependencies

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

FROM base AS builder

COPY --from=dependencies /app/node_modules ./node_modules
COPY . .

ARG NEXT_PUBLIC_SITE_URL=https://rpmrent.ru
ARG NEXT_PUBLIC_VK_PIXEL_ID
ARG NEXT_PUBLIC_VK_LEAD_GOAL=lead
ARG NEXT_PUBLIC_YANDEX_METRIKA_ID
ARG NEXT_PUBLIC_TELEGRAM_URL
ARG NEXT_PUBLIC_PHONE
ARG NEXT_PUBLIC_ADDRESS
ARG NEXT_PUBLIC_EMAIL
ARG NEXT_PUBLIC_HOURS
ARG NEXT_PUBLIC_MAP_EMBED_URL

ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_VK_PIXEL_ID=$NEXT_PUBLIC_VK_PIXEL_ID
ENV NEXT_PUBLIC_VK_LEAD_GOAL=$NEXT_PUBLIC_VK_LEAD_GOAL
ENV NEXT_PUBLIC_YANDEX_METRIKA_ID=$NEXT_PUBLIC_YANDEX_METRIKA_ID
ENV NEXT_PUBLIC_TELEGRAM_URL=$NEXT_PUBLIC_TELEGRAM_URL
ENV NEXT_PUBLIC_PHONE=$NEXT_PUBLIC_PHONE
ENV NEXT_PUBLIC_ADDRESS=$NEXT_PUBLIC_ADDRESS
ENV NEXT_PUBLIC_EMAIL=$NEXT_PUBLIC_EMAIL
ENV NEXT_PUBLIC_HOURS=$NEXT_PUBLIC_HOURS
ENV NEXT_PUBLIC_MAP_EMBED_URL=$NEXT_PUBLIC_MAP_EMBED_URL

RUN pnpm prisma:generate
RUN pnpm exec next build

FROM base AS tools

ENV NODE_ENV=production

COPY --from=dependencies /app/node_modules ./node_modules
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml prisma.config.ts tsconfig.json ./
COPY prisma ./prisma
COPY scripts ./scripts
COPY src ./src

RUN pnpm prisma:generate

FROM node:22-bookworm-slim AS runner

ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

RUN groupadd --system --gid 1001 nodejs \
  && useradd --system --uid 1001 --gid nodejs nextjs

WORKDIR /app

COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]

