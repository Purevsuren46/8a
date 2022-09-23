const User = require("../models/User");
const Wallet = require("../models/Wallet");
const MyError = require("../utils/myError");
const asyncHandler = require("express-async-handler");
const paginate = require("../utils/paginate");
const sendEmail = require("../utils/email");
const crypto = require("crypto");
const Phone = require("../models/Phone");
const axios = require("axios");



// register
exports.register = asyncHandler(async (req, res, next) => {
  const user = await User.create(req.body);

  const token = user.getJsonWebToken();

  res.status(200).json({
    success: true,
    token,
    user: user,
  });
});

// логин хийнэ
exports.login = asyncHandler(async (req, res, next) => {
  const { phone, password } = req.body;

  // Оролтыгоо шалгана

  if (!phone || !password) {
    throw new MyError("Имэйл болон нууц үгээ дамжуулна уу", 400);
  }

  // Тухайн хэрэглэгчийн хайна
  const user = await User.findOne({ phone }).select("+password");

  if (!user) {
    throw new MyError("Имэйл болон нууц үгээ зөв оруулна уу", 401);
  }

  const ok = await user.checkPassword(password);

  if (!ok) {
    throw new MyError("Имэйл болон нууц үгээ зөв оруулна уу", 401);
  }

  const token = user.getJsonWebToken();

  const cookieOption = {
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    httpOnly: true,
  };

  res.status(200).cookie("amazon-token", token, cookieOption).json({
    success: true,
    token,
    user: user,
  });
});

exports.logout = asyncHandler(async (req, res, next) => {
  const cookieOption = {
    expires: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
    httpOnly: true,
  };

  res.status(200).cookie("amazon-token", null, cookieOption).json({
    success: true,
    data: "logged out...",
  });
});

exports.getUsers = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const sort = req.query.sort;
  const select = req.query.select;

  ["select", "sort", "page", "limit"].forEach((el) => delete req.query[el]);

  const pagination = await paginate(page, limit, User);

  const users = await User.find(req.query, select)
    .sort(sort)
    .skip(pagination.start - 1)
    .limit(limit);

  res.status(200).json({
    success: true,
    data: users,
    pagination,
  });
});

exports.getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    throw new MyError(req.params.id + " ID-тэй хэрэглэгч байхгүй!", 400);
  }
  if (user.deadline < Date.now()) {
    res.status(200).json({
      success: true,
      data: user,
      time: false
    });
  } else {
    res.status(200).json({
      success: true,
      data: user,
      time: true
    });
  }


});

exports.sendPhone = asyncHandler(async (req, res, next) => {
  const cv = await User.findOne({phone: req.body.phone})
  const phon = await Phone.findOne({phone: req.body.phone})

  if (cv == null) {
    const random = Math.floor(1000 + Math.random() * 9000);
    const params = `from=72773055&to=${req.body.phone}&text=Таны бүртгэл үүсгэх нууц код ${random}`
    const param = encodeURI(params)
    await axios({
      method: "get",
      url: `https://api.messagepro.mn/send?key=63053350aa1c4d36e94d0756f4ec160e&${param}`
    })
  req.body.random = random
  
  } else {
    throw new MyError("Утас бүртгүүлсэн байна", 400)
  }

  if (phon == null) {
    const phone = await Phone.create(req.body)
    res.status(200).json({
      success: true,
    });
  } else {
    phon.random = req.body.random
    phon.save()
    res.status(200).json({
      success: true,
    });
  }
  
});

exports.createUser = asyncHandler(async (req, res, next) => {
  const random = await Phone.findOne({random: req.body.random})
  if (random == null) {
    throw new MyError("Мессежний код буруу байна", 400)
  } else {
    req.body.phone = random.phone
    req.body.role = "user"
    const posts = await User.create(req.body);
    const rando = await Phone.deleteOne({random: req.body.random})

const token = posts.getJsonWebToken();
    res.status(200).json({
      success: true,
      data: posts,
      token,
    });
    
  }
});

exports.updateUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    throw new MyError(req.params.id + " ID-тэй хэрэглэгч байхгүйээээ.", 400);
  }

  res.status(200).json({
    success: true,
    data: user,
  });
});

exports.deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    throw new MyError(req.params.id + " ID-тэй хэрэглэгч байхгүйээээ.", 400);
  }

  user.remove();

  res.status(200).json({
    success: true,
    data: user,
  });
});

exports.forgotPassword = asyncHandler(async (req, res, next) => {
  if (!req.body.phone) {
    throw new MyError("Та нууц үг сэргээх утас дамжуулна уу", 400);
  }

  const cv = await User.findOne({ phone: req.body.phone });

  if (!cv) {
    throw new MyError(req.body.phone + " утастай хэрэглэгч олдсонгүй!", 400);
  }
  if (cv.forgotPasswordPhoneDate == undefined) {
    const resetToken = cv.generatePasswordChangeToken();
    await cv.save();
  

    const link = `${resetToken}`;
  
    const message = `Нууц үг өөрчлөх код: ${link}`;
    const param = encodeURI(message)
  

      await axios({
      method: "get",
      url: `https://api.messagepro.mn/send?key=63053350aa1c4d36e94d0756f4ec160e&from=72773055&to=${req.body.phone}&text=${param}`
    })
  
    cv.forgotPasswordPhoneDate = Date.now()
    cv.save()
  
    res.status(200).json({
      success: true,
    });
  } else {
    if (cv.forgotPasswordPhoneDate.getTime()  + 60 * 1000 > Date.now()) {
      throw new MyError("1 минутын дараа нууц үг солих мсж илгээх боломжтой", 400);
    }
  
    const resetToken = cv.generatePasswordChangeToken();
    await cv.save();
  

    const link = `${resetToken}`;
  
    const message = `Нууц үг өөрчлөх код: ${link}`;
    const param = encodeURI(message)
  

      await axios({
      method: "get",
      url: `https://api.messagepro.mn/send?key=63053350aa1c4d36e94d0756f4ec160e&from=72773055&to=${req.body.phone}&text=${param}`
    })
  
    cv.forgotPasswordPhoneDate = Date.now()
    cv.save()
  
    res.status(200).json({
      success: true,
    });
  }

});

exports.resetPassword = asyncHandler(async (req, res, next) => {
  if (!req.body.resetToken || !req.body.password) {
    throw new MyError("Та токен болон нууц үгээ дамжуулна уу", 400);
  }

  const encrypted = req.body.resetToken

  const user = await User.findOne({
    resetPasswordToken: encrypted,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    throw new MyError("Токен хүчингүй байна!", 400);
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  const token = user.getJsonWebToken();

  res.status(200).json({
    success: true,
    token,
    user: user,
  });
});

exports.changePhoneRequest = asyncHandler(async (req, res, next) => {

  const cv = await User.findById(req.userId)
  const cv1 = await User.findOne({phone: req.body.newPhone})
  console.log(cv)
  const phon = await Phone.findOne({phone: cv.phone})

  if (cv1 == null) {
    const random = Math.floor(1000 + Math.random() * 9000);
    const params = `from=72773055&to=${req.body.newPhone}&text=Таны дугаар солих нууц код ${random}`
    const param = encodeURI(params)
    await axios({
      method: "get",
      url: `https://api.messagepro.mn/send?key=63053350aa1c4d36e94d0756f4ec160e&${param}`
    })
  req.body.random = random
  
  } else {
    throw new MyError("Утас бүртгүүлсэн байна", 400)
  }

  if (phon == null) {
    req.body.phone = cv.phone
    const phone = await Phone.create(req.body)
    res.status(200).json({
      success: true,
    });
  } else {
    phon.newPhone = req.body.newPhone
    phon.random = req.body.random
    phon.save()
    res.status(200).json({
      success: true,
    });
  }
  
});

exports.changePhone = asyncHandler(async (req, res, next) => {

  const random = await Phone.findOne({random: req.body.random})
  if (random == null) {
    throw new MyError("Мессежний код буруу байна", 400)
  } else {
  const cv = await User.findOne({phone: random.phone})
    cv.phone = random.newPhone
    cv.save()
    const rando = await Phone.deleteOne({random: req.body.random})

    
    res.status(200).json({
      success: true,
      data: cv,
    });
  }

});

exports.invoiceTime = asyncHandler(async (req, res, next) => {
  const profile = await User.findById(req.params.id);
  const a = 0
  await axios({
    method: 'post',
    url: 'https://merchant.qpay.mn/v2/auth/token',
    headers: {
      Authorization: `Basic SUhFTFA6NXNEdkVRazM=`
    },

  }).then(response => {
    const token = response.data.access_token;

    axios({
      method: 'post',
      url: 'https://merchant.qpay.mn/v2/invoice',
      headers: {
        Authorization: `Bearer ${token}`
      },
      data: {
        invoice_code: "IHELP_INVOICE",
        sender_invoice_no: "12345678",
        invoice_receiver_code: `${profile.phone}`,
        invoice_description:`8а charge ${profile.email}`,
        
        amount: req.body.amount,
        callback_url:`http://159.223.82.71/api/v1/users/callbacks/${req.params.id}/${req.body.amount}`
      }
    }).then(async (response) => {
      req.body.urls = response.data.urls
      req.body.qrImage = response.data.qr_image
      req.body.invoiceId = response.data.invoice_id
      const wallet = await Wallet.create(req.body)
      profile.invoiceId = wallet._id
      a = wallet._id
      profile.save()
    })
    .catch(error => {
      console.log(error.response.data);
    });
  })
  .catch(error => {
    console.log(error.response.data);
  });


  res.status(200).json({
    success: true,
    data: a,
  });
});

exports.chargeTime = asyncHandler(async (req, res, next) => {
  const profile = await User.findById(req.params.id);
  // const wallet = await Wallet.findById(profile.invoiceId)
  // const charge = req.query
  // console.log(charge.qpay_payment_id)
  // let messages = [];

  // messages.push({
  //     to: profile.expoPushToken,
  //     sound: 'default',
  //     body: `${(req.params.numId / 1000)} Хоногоор нэмэгдлээ`,
  //     data: { data: "notification._id" },
  //   })


    if (profile.deadline < Date.now()) {
      if (req.params.numId == 100) {
        profile.deadline = Date.now() + 60 * 60 * 1000 * 24 * 30
    } else if (req.params.numId == 150) {
      profile.deadline = Date.now() + 60 * 60 * 1000 * 24 * 60
    } else if (req.params.numId == 200) {
      profile.deadline = Date.now() + 60 * 60 * 1000 * 24 * 90
    } 
    } else {
      if (req.params.numId == 100) {
        profile.deadline = profile.deadline.getTime() + 60 * 60 * 1000 * 24 * 30
    } else if (req.params.numId == 150) {
        profile.deadline = profile.deadline.getTime() + 60 * 60 * 1000 * 24 * 60
    } else if (req.params.numId == 200) {
        profile.deadline = profile.deadline.getTime() + 60 * 60 * 1000 * 24 * 90
    } 
    }

    profile.save()

  res.status(200).json({
    success: true,
    data: profile,
  });
});

