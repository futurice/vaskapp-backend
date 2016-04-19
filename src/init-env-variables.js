// Configuration of the app is done via environment variables

process.env.NODE_ENV = process.env.NODE_ENV || 'development';
process.env.PORT = process.env.PORT || 80;

// Appended to each image url
process.env.IMGIX_QUERY = process.env.IMGIX_QUERY || '?fit=fill&bg=FFFFFF&w=800&h=800';
