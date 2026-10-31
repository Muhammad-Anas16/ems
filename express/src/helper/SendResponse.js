const SendResponse = (
  res,
  statusCode = 500,
  success = false,
  data = null,
  message = "Internal Server Error",
) => {
  res.status(statusCode).json({
    status: statusCode,
    success: success,
    data: data,
    message: message,
  });
};

export default SendResponse;
