# Build stage
FROM golang:1.26-alpine AS builder

WORKDIR /app

ENV GOPROXY=https://goproxy.cn,direct

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o /server ./cmd/server

# Runtime stage
FROM scratch

COPY --from=builder /server /server
# Static files for the admin web UI. Served by Gin's StaticFile handler;
# CWD is "/" inside scratch, so admin/ resolves to /admin/index.html.
COPY --from=builder /app/admin /admin

EXPOSE 8080

ENTRYPOINT ["/server"]
