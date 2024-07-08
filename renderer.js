/** @format */

(function () {
  const express = require("express");
  const morgan = require("morgan");
  const app = express();
  const cors = require("cors");
  const Jimp = require("jimp");
  const request = require("request");
  const fs = require("fs");
  const { PNG } = require("pngjs");
  const path = require("path");

  const bodyParser = require("body-parser");
  app.use(cors());

  app.use(bodyParser.json());
  app.use(morgan());

  app.get("/", async (req, res) => {
    res.status(200).send("dsa");
  });

  app.post("/print-receipt", async (req, res) => {
    const { printingData } = req.body;
    console.log("printing data11", printingData);
    const { storeDetail, receipt } = printingData;

    try {
      const ThermalPrinter = require("node-thermal-printer").printer;
      const PrinterTypes = require("node-thermal-printer").types;
      let printer = new ThermalPrinter({
        type: PrinterTypes.EPSON, // Printer type: 'star' or 'epson'
        interface: `tcp://${storeDetail?.printerConfiguration?.printerIPAddress}`, // Printer interface// Printer character set - default: SLOVENIA      removeSpecialCharacters: false, // Removes special characters - default: false
        lineCharacter: "=",
        characterSet: "SLOVENIA", // Set character for lines - default: "-"
        options: {
          // Additional options
          timeout: 5000, // Connection timeout (ms) [applicable only for network printers] - default: 3000
        },
      });

      // Print the order header
      const storeName = storeDetail?.storeDetails?.name;
      const storeAddress = storeDetail?.storeDetails?.location;
      const phoneNumber = storeDetail?.storeDetails?.phoneNumber;
      const headerText = storeDetail?.receiptConfiguration?.receiptHeaderText;
      const footerText = storeDetail?.receiptConfiguration?.receiptFooterText;
      const orderNumber = receipt?.orderNo;

      const customerName = receipt?.customerName;
      const orderDate = receipt?.orderDate;
      const paymentMethod = receipt?.paymentMethod;
      const totalPrice = receipt?.totalPaymentAmount;
      const discountAmount = receipt?.discountAmount;
      const subTotal = receipt?.products?.reduce(
        (acc, item) => acc + item.quantity * item.boughtPrice,
        0
      );

      // Print store details and header

      printer.alignCenter();
      printer.bold(true);
      printer.setTextSize(1, 1);
      printer.println(`  ${storeName}`);
      printer.setTextNormal();

      printer.println(`  ${storeAddress}`);
      printer.println(`Phone: ${phoneNumber}`);
      printer.println(`DDA Reg. No: 3801026/20355`);
      printer.println(`PAN No: 102214756`);

      printer.println(`  Reciept`);

      printer.println(`${headerText}`);

      printer.newLine();

      // Print order details
      printer.alignLeft();

      printer.println(`Order No.: ${orderNumber}`);
      printer.println(`Date: ${orderDate}`);

      if (customerName) {
        printer.println(`Customer: ${customerName}`);
      }

      if (paymentMethod) {
        printer.println(`Payment Method: ${paymentMethod}`);
      }
      printer.bold(false);
      printer.newLine();
      printer.drawLine();
      printer.tableCustom([
        { text: "Items", width: 0.5, bold: true, align: "LEFT" },
        { text: "Qty", width: 0.1, bold: true, align: "LEFT" },
        { text: "Rate", width: 0.2, bold: true, align: "LEFT" },
        { text: "Amount", width: 0.2, bold: true, align: "LEFT" },
      ]);

      receipt?.products?.forEach((item, index1) => {
        function splitString(str, len) {
          const regex = new RegExp(`.{1,${len}}`, "g");
          const lines = str.match(regex);
          return lines || [];
        }
        // Format the item name, quantity, and price
        const itemName = splitString(item.productName, 20);
        const itemQuantity = item.quantity;
        const itemPrice = `${item.boughtPrice}`;
        const totalPrice = `${Number(item.boughtPrice) * itemQuantity}`;

        printer.tableCustom([
          {
            text: `${index1 + 1 + ")  " + itemName}`,
            width: 0.5,
          },
          { text: itemQuantity, width: 0.1 },
          { text: itemPrice, width: 0.2 },
          { text: totalPrice, width: 0.2 },
        ]);
      });
      // if (
      //   printingData?.printingInvoiceDetailsResponseViewModels?.[0]
      //     ?.orderItemsDetailsResponseViewModels?.length > 0
      // ) {
      //   printer.println(`------------------------------------------------`);
      // }

      // // Define the table header

      // // Print each item in the order
      // // Print each item in the order
      // if (printingData?.isSendToKitchen) {
      //   if (
      //     printingData?.printingInvoiceDetailsResponseViewModels?.[0]
      //       ?.orderItemsDetailsResponseViewModels?.length > 0
      //   ) {
      //     printer.tableCustom([
      //       { text: "Items", width: 0.8, align: "LEFT", bold: true },
      //       { text: "Qty", width: 0.2, align: "LEFT", bold: true },
      //     ]);

      //     printingData?.printingInvoiceDetailsResponseViewModels?.[0]?.orderItemsDetailsResponseViewModels?.forEach(
      //       (item, index1) => {
      //         // Format the item name, quantity, and price
      //         const itemName = splitString(item.itemName, 20);
      //         const itemQuantity = item.quantity;

      //         printer.tableCustom([
      //           {
      //             text: `${
      //               index1 +
      //               1 +
      //               ")" +
      //               itemName +
      //               (item.description ? `[ ${item.description} ]` : ``)
      //             }`,
      //             width: 0.8,
      //             align: "LEFT",
      //           },
      //           { text: itemQuantity, width: 0.2, align: "LEFT" },
      //         ]);
      //         item?.modifiers?.length > 0 &&
      //           item?.modifiers?.forEach((eachOrder, index) => {
      //             printer.tableCustom([
      //               {
      //                 text: ` -${eachOrder.modifierName}`,
      //                 width: 0.8,
      //                 align: "LEFT",
      //               },
      //               {
      //                 text: printingData?.isSendToKitchen
      //                   ? `${eachOrder.quantity}`
      //                   : `$${eachOrder.modifierPrice}`,
      //                 width: 0.2,
      //                 align: "LEFT",
      //               },
      //             ]);
      //           });
      //       }
      //     );
      //   }
      //   if (
      //     printingData?.printingInvoiceDetailsResponseViewModels?.[0]
      //       ?.setMenuOrderOrderDetailsResponseViewModels?.length > 0
      //   ) {
      //     printer.println(`------------------------------------------------`);
      //   }

      //   if (
      //     printingData?.printingInvoiceDetailsResponseViewModels?.[0]
      //       ?.setMenuOrderOrderDetailsResponseViewModels?.length > 0
      //   ) {
      //     printer.tableCustom([
      //       {
      //         text: "Combo pack Items",
      //         width: 0.8,
      //         align: "LEFT",
      //         bold: true,
      //       },
      //       { text: "Qty", width: 0.2, align: "LEFT", bold: true },
      //     ]);

      //     printingData?.printingInvoiceDetailsResponseViewModels?.[0]?.setMenuOrderOrderDetailsResponseViewModels?.forEach(
      //       (item, index1) => {
      //         // Format the item name, quantity, and price
      //         const itemName = item.setMenuName;
      //         const itemQuantity = item.quantity;

      //         printer.tableCustom([
      //           {
      //             text: `${index1 + 1 + ")" + itemName}`,
      //             width: 0.8,
      //             align: "LEFT",
      //           },
      //           { text: itemQuantity, width: 0.2, align: "LEFT" },
      //         ]);

      //         item?.orderItemsDetailsResponseViewModels?.length > 0 &&
      //           item?.orderItemsDetailsResponseViewModels?.forEach(
      //             (eachOrder, index) => {
      //               printer.tableCustom([
      //                 {
      //                   text: ` -${eachOrder.itemName}`,
      //                   width: 0.9,
      //                   align: "LEFT",
      //                 },
      //               ]);
      //             }
      //           );
      //       }
      //     );
      //   }
      //   if (
      //     printingData?.printingInvoiceDetailsResponseViewModels?.[0]
      //       ?.description
      //   ) {
      //     printer.println(`------------------------------------------------`);
      //     printer.println(
      //       `Description: ${printingData?.printingInvoiceDetailsResponseViewModels?.[0]?.description}`
      //     );
      //   }
      // } else {
      //   if (
      //     printingData?.printingInvoiceDetailsResponseViewModels?.[0]
      //       ?.orderItemsDetailsResponseViewModels?.length > 0
      //   ) {

      //     printingData?.printingInvoiceDetailsResponseViewModels?.[0]?.orderItemsDetailsResponseViewModels?.forEach(
      //       (item, index1) => {
      //         // Format the item name, quantity, and price
      //         const itemName = splitString(item.itemName, 20);
      //         const itemQuantity = item.quantity;
      //         const itemPrice = `$${item.price}`;

      //         printer.tableCustom([
      //           {
      //             text: `${index1 + 1 + ")" + itemName}`,
      //             width: 0.7,
      //           },
      //           { text: itemQuantity, width: 0.1 },
      //           { text: itemPrice, width: 0.2 },
      //         ]);
      //         item?.modifiers?.length > 0 &&
      //           item?.modifiers?.forEach((eachOrder, index) => {
      //             printer.tableCustom([
      //               {
      //                 text: ` -${eachOrder.modifierName}`,
      //                 width: 0.8,
      //                 align: "LEFT",
      //               },

      //               {
      //                 text: printingData?.isSendToKitchen
      //                   ? `${eachOrder.quantity}`
      //                   : `$${eachOrder.modifierPrice}`,
      //                 width: 0.2,
      //                 align: "LEFT",
      //               },
      //             ]);
      //           });
      //       }
      //     );
      //     if (
      //       printingData?.printingInvoiceDetailsResponseViewModels?.[0]
      //         ?.setMenuOrderOrderDetailsResponseViewModels?.length > 0
      //     ) {
      //       printer.tableCustom([
      //         { text: "Combo Pack Items", bold: true, align: "LEFT" },
      //         { text: "Qty", bold: true, align: "LEFT" },
      //         { text: "Price", bold: true, align: "LEFT" },
      //       ]);
      //       printingData?.printingInvoiceDetailsResponseViewModels?.[0]?.setMenuOrderOrderDetailsResponseViewModels?.forEach(
      //         (item, index1) => {
      //           // Format the item name, quantity, and price
      //           const itemName = splitString(item.setMenuName, 20);
      //           const itemQuantity = item.quantity;
      //           const itemPrice = `$${item.price}`;

      //           printer.tableCustom([
      //             { text: `${index1 + 1 + ")" + itemName}`, width: 0.6 },
      //             { text: itemQuantity, width: 0.2 },

      //             { text: itemPrice, width: 0.2 },
      //           ]);
      //         }
      //       );
      //     }
      //   }
      // }

      // // Function to split a string into multiple lines
      // function splitString(str, len) {
      //   const regex = new RegExp(`.{1,${len}}`, "g");
      //   const lines = str.match(regex);
      //   return lines || [];
      // }
      // // Print the table footer
      // // Print total price
      // printer.println(`------------------------------------------------`);

      // printer.alignRight();
      // if (!printingData?.isSendToKitchen) {
      //   if (
      //     parseFloat(
      //       printingData?.printingInvoiceDetailsResponseViewModels?.[0]
      //         ?.tipAmount
      //     ) > 0.0
      //   ) {
      //     printer.println(
      //       `   Tip Amount:    $${printingData?.printingInvoiceDetailsResponseViewModels?.[0]?.tipAmount}`
      //     );
      //   }
      //   if (
      //     parseFloat(
      //       printingData?.printingInvoiceDetailsResponseViewModels?.[0]
      //         ?.creditCardSurchargeAmountWithTax
      //     ) > 0.0
      //   ) {
      //     if (
      //       printingData?.printingInvoiceDetailsResponseViewModels?.[0]
      //         ?.taxExclusiveInclusiveType == "TaxInclusive"
      //     ) {
      //       printer.println(
      //         `   Credit Card Surcharge Amount:    $${printingData?.printingInvoiceDetailsResponseViewModels?.[0]?.creditCardSurchargeAmountWithTax}`
      //       );
      //     } else {
      //       printer.println(
      //         `   Credit Card Surcharge Amount:    $${printingData?.printingInvoiceDetailsResponseViewModels?.[0]?.creditCardSurchargeAmount}`
      //       );
      //     }
      //   }
      //   if (
      //     parseFloat(
      //       printingData?.printingInvoiceDetailsResponseViewModels?.[0]
      //         ?.publicHolidaySurCharge
      //     ) > 0.0
      //   ) {
      //     if (
      //       printingData?.printingInvoiceDetailsResponseViewModels?.[0]
      //         ?.taxExclusiveInclusiveType == "TaxInclusive"
      //     ) {
      //       printer.println(
      //         `   Holiday Surcharge Amount:    $${printingData?.printingInvoiceDetailsResponseViewModels?.[0]?.publicHolidaySurChargeWithTax}`
      //       );
      //     } else {
      //       printer.println(
      //         `   Holiday Surcharge Amount:    $${printingData?.printingInvoiceDetailsResponseViewModels?.[0]?.publicHolidaySurCharge}`
      //       );
      //     }
      //   }
      //   if (
      //     parseFloat(
      //       printingData?.printingInvoiceDetailsResponseViewModels?.[0]
      //         ?.discount
      //     ) > 0.0
      //   ) {
      //     if (
      //       printingData?.printingInvoiceDetailsResponseViewModels?.[0]
      //         ?.taxExclusiveInclusiveType == "TaxInclusive"
      //     ) {
      //       printer.println(
      //         `   Discount Amount:    $${printingData?.printingInvoiceDetailsResponseViewModels?.[0]?.discountWithTax}`
      //       );
      //     } else {
      //       printer.println(
      //         `   Discount Amount:    $${printingData?.printingInvoiceDetailsResponseViewModels?.[0]?.discount}`
      //       );
      //     }
      //   }

      // }

      printer.drawLine();

      printer.alignRight();
      printer.println(`   Subtotal:    ${subTotal}`);

      printer.println(`   Discount:    ${discountAmount}`);
      printer.println(`   Total:  ${totalPrice}`);
      // printer.newLine();
      // printer.newLine();
      // printer.alignCenter();
      // printer.bold(true);
      // if (printingData?.isPrintFromPayScreen) {
      //   printer.println(`*CreditcardSurchage may apply`);
      //   printer.println(`*Redeem code discount may apply`);
      // }
      // printer.bold(false);

      printer.newLine();
      printer.newLine();
      printer.alignCenter();

      printer.bold(true);

      printer.println(`${footerText}`);

      // printer.setTextNormal();
      // printer.println(
      //   `ABN: ${printingData?.printingInvoiceDetailsResponseViewModels?.[0]?.abnNumber}`
      // );
      printer.bold(false);

      // Print and disconnect the printer
      printer.cut();
      printer.execute();
      console.error("Print done!");
      res.status(200).json({ success: "this is working" });
    } catch (error) {
      console.log("Print failed:", error);
      res.status(400).json({ message: "" });
    }
  });

  app.listen(7823, () => {});
  module.exports = app;
})();
