declare namespace Cloudflare {
  interface Env {
    AREA50_ADMIN_CODE: string;
    JWT_SECRET: string;
    CLOUDINARY_CLOUD_NAME: string;
    CLOUDINARY_UPLOAD_PRESET: string;
  }
}

interface Env extends Cloudflare.Env {}
