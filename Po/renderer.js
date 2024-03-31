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

  var corsOptions = {
    origin: "http://localhost:3000",
    optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
  };
  const bodyParser = require("body-parser");
  app.use(cors(corsOptions));
  app.use(bodyParser.json());
  app.use(morgan());
  const connectPrinter = async () => {
    const ThermalPrinter = require("node-thermal-printer").printer;
    const PrinterTypes = require("node-thermal-printer").types;
    console.log("body data");
    let printer = new ThermalPrinter({
      type: PrinterTypes.STAR, // Printer type: 'star' or 'epson'
      interface: "tcp://192.168.1.87:9100", // Printer interface// Printer character set - default: SLOVENIA      removeSpecialCharacters: false, // Removes special characters - default: false
      lineCharacter: "=",
      characterSet: "SLOVENIA", // Set character for lines - default: "-"
      options: {
        // Additional options
        timeout: 5000, // Connection timeout (ms) [applicable only for network printers] - default: 3000
      },
    });
    let isConnected = await printer.isPrinterConnected(); // Check if printer is connected, return bool of status
    let execute = await printer.execute(); // Executes all the commands. Returns success or throws error
    // let raw = await printer.raw(Buffer.from("Hello world")); // Print instantly. Returns success or throws error

    console.log(isConnected, "connected to printer");
    // printer.alignCenter();
    // printer.bold(true);
    // printer.print("MY STORE\n");
    // printer.bold(false);
    // printer.print("123 Main St.\n");
    // printer.print("Anytown, USA 12345\n");
    // printer.print("\n");
    // printer.alignLeft();
    // printer.tableCustom([
    //   { text: "Qty", width: 0.15 },
    //   { text: "Item", width: 0.45 },
    //   { text: "Price", width: 0.2 },
    //   { text: "Total", width: 0.2 },
    // ]);
    // printer.tableCustom([
    //   { text: "1", width: 0.15 },
    //   { text: "Widget", width: 0.45 },
    //   { text: "$9.99", width: 0.2 },
    //   { text: "$9.99", width: 0.2 },
    // ]);
    // printer.tableCustom([
    //   { text: "2", width: 0.15 },
    //   { text: "Gizmo", width: 0.45 },
    //   { text: "$4.99", width: 0.2 },
    //   { text: "$9.98", width: 0.2 },
    // ]);
    // printer.print("\n");
    // printer.alignRight();
    // printer.print("Subtotal: $19.97\n");
    // printer.print("Tax: $1.50\n");
    // printer.print("Total: $21.47\n");
    // printer.print("\n");
    // printer.alignCenter();
    // printer.print("Thank you for shopping at My Store!\n");
    // printer.print("\n\n\n\n\n\n");
    // printer.cut();
    // printer.execute();
  };
  connectPrinter();
  app.get("/", async (req, res) => {
    res.status(200).send("dsa");
  });
  app.post("/printBarcodeImage", async (req, res) => {
    const { printingData } = req.body;
    const iterationOfPrint = printingData?.image?.length;
    const imageUrl = printingData?.image?.[0];
    console.log("printing data", printingData);

    try {
      const ThermalPrinter = require("node-thermal-printer").printer;
      const PrinterTypes = require("node-thermal-printer").types;
      console.log("body data");
      let printer = new ThermalPrinter({
        type: PrinterTypes.STAR, // Printer type: 'star' or 'epson'
        interface: "tcp://192.168.1.87:9100", // Printer interface// Printer character set - default: SLOVENIA      removeSpecialCharacters: false, // Removes special characters - default: false
        lineCharacter: "=",
        characterSet: "SLOVENIA", // Set character for lines - default: "-
        removeSpecialCharacters: false,
        replaceSpecialCharacters: true,
        options: {
          // Additional options
          timeout: 5000, // Connection timeout (ms) [applicable only for network printers] - default: 3000
        },
      });
      let isConnected = await printer.isPrinterConnected(); // Check if printer is connected, return bool of status
      let execute = await printer.execute(); // Executes all the commands. Returns success or throws error
      // let raw = await printer.raw(Buffer.from("Hello world")); // Print instantly. Returns success or throws error

      console.log(isConnected, "connected to printer");
      const buffer = fs.readFileSync("./image.png");

      printer.printImage(buffer, { width: "max" }, (err) => {
        if (err) throw err;
        printer.cut();
        printer.execute((err) => {
          if (err) throw err;
          console.log("Image printed successfully");
        });
      });

      console.error("Print done!");
      res.status(200).json({ success: "this is working" });
    } catch (error) {
      console.log("Print failed:", error);
      res.status(400).json({ message: "" });
    }
  });
  app.post("/printKitchen", async (req, res) => {
    const { printingData } = req.body;
    console.log("printing data11", printingData);
    console.log(
      "printing data",
      printingData?.printingInvoiceDetailsResponseViewModels?.[0]
        ?.orderItemsDetailsResponseViewModels
    );

    // printer.alignCenter();
    // printer.println("Hello world");
    // printer.cut();

    try {
      const ThermalPrinter = require("node-thermal-printer").printer;
      const PrinterTypes = require("node-thermal-printer").types;
      console.log("body data");
      let printer = new ThermalPrinter({
        type: PrinterTypes.EPSON, // Printer type: 'star' or 'epson'
        interface: "tcp://192.168.1.87:9100", // Printer interface// Printer character set - default: SLOVENIA      removeSpecialCharacters: false, // Removes special characters - default: false
        lineCharacter: "=",
        characterSet: "SLOVENIA", // Set character for lines - default: "-"
        options: {
          // Additional options
          timeout: 5000, // Connection timeout (ms) [applicable only for network printers] - default: 3000
        },
      });
      let isConnected = await printer.isPrinterConnected(); // Check if printer is connected, return bool of status
      let execute = await printer.execute(); // Executes all the commands. Returns success or throws error
      // let raw = await printer.raw(Buffer.from("Hello world")); // Print instantly. Returns success or throws error

      console.log(isConnected, "connected to printer");

      // Print the order header
      const storeName =
        printingData?.printingInvoiceDetailsResponseViewModels?.[0]?.storeName;
      const storeAddress =
        printingData?.printingInvoiceDetailsResponseViewModels?.[0]
          ?.storeAddress;
      const date =
        printingData?.printingInvoiceDetailsResponseViewModels?.[0]?.date;
      const orderNumber =
        printingData?.printingInvoiceDetailsResponseViewModels?.[0]
          ?.orderNumber;
      const channel =
        printingData?.printingInvoiceDetailsResponseViewModels?.[0]?.channel;
      const tableNumber =
        printingData?.printingInvoiceDetailsResponseViewModels?.[0]
          ?.tableNumber;
      const customerName =
        printingData?.printingInvoiceDetailsResponseViewModels?.[0]
          ?.customerName;
      const orderType =
        printingData?.printingInvoiceDetailsResponseViewModels?.[0]?.orderType;
      const orderItems =
        printingData?.printingInvoiceDetailsResponseViewModels?.[0]
          ?.orderItemsDetailsResponseViewModels;
      const taxAmount =
        printingData?.printingInvoiceDetailsResponseViewModels?.[0]?.tax;
      const totalPrice =
        printingData?.printingInvoiceDetailsResponseViewModels?.[0]
          ?.totalAmount;

      // Print store details and header
      printer.bold(true);
      printer.setTextSize(1, 1);
      printer.println(`  ${storeName}`);
      printer.setTextNormal();

      printer.println(`  ${storeAddress}`);
      printer.println(`  ${date}`);
      printer.drawLine();

      // Print order details

      printer.println(`Order No.: ${orderNumber}`);
      if (channel) {
        printer.println(`Server: ${channel}`);
      }
      if (tableNumber) {
        printer.println(`Table: ${tableNumber}`);
      }
      if (customerName) {
        printer.println(`Customer: ${customerName}`);
      }
      if (orderType) {
        printer.println(`Order Type: ${orderType}`);
      }
      printer.bold(false);
      printer.drawLine();

      // Define the table header

      // Print each item in the order
      // Print each item in the order
      if (printingData?.isSendToKitchen) {
        printer.tableCustom([
          { text: "Item", width: 0.45 },
          { text: "Qty", width: 0.15 },
        ]);
        printingData?.printingInvoiceDetailsResponseViewModels?.[0]?.orderItemsDetailsResponseViewModels?.forEach(
          (item, index1) => {
            // Format the item name, quantity, and price
            const itemName = splitString(item.itemName, 20);
            const itemQuantity = item.quantity;

            printer.tableCustom([
              { text: itemName, width: 0.8 },
              { text: itemQuantity, width: 0.2 },
            ]);
          }
        );
      } else {
        printer.tableCustom([
          { text: "Item", width: 0.45 },
          { text: "Qty", width: 0.15 },

          { text: "Price", width: 0.2 },
          { text: "Total", width: 0.2 },
        ]);
        printingData?.printingInvoiceDetailsResponseViewModels?.[0]?.orderItemsDetailsResponseViewModels?.forEach(
          (item, index1) => {
            // Format the item name, quantity, and price
            const itemName = splitString(item.itemName, 20);
            const itemQuantity = item.quantity;
            const itemPrice = `$${item.price}`;

            printer.tableCustom([
              { text: itemName, width: 0.45 },
              { text: itemQuantity, width: 0.15 },

              { text: itemPrice, width: 0.2 },
              {
                text: parseFloat(itemQuantity) * parseFloat(item.price),
                width: 0.2,
              },
            ]);
          }
        );
      }

      // Function to split a string into multiple lines
      function splitString(str, len) {
        const regex = new RegExp(`.{1,${len}}`, "g");
        const lines = str.match(regex);
        return lines || [];
      }
      // Print the table footer
      // Print total price
      printer.drawLine();
      if (!printingData?.isSendToKitchen) {
        if (
          printingData?.printingInvoiceDetailsResponseViewModels?.[0]
            ?.tipAmount != "0.00"
        ) {
          printer.println(
            `   Tip Amount:    $${printingData?.printingInvoiceDetailsResponseViewModels?.[0]?.tipAmount}`
          );
        }
        if (
          printingData?.printingInvoiceDetailsResponseViewModels?.[0]
            ?.creditCardSurchargeAmount != "0.00" &&
          printingData?.printingInvoiceDetailsResponseViewModels?.[0]
            ?.creditCardSurchargeAmount
        ) {
          printer.println(
            `   Credit Card Surcharge Amount:    $${printingData?.printingInvoiceDetailsResponseViewModels?.[0]?.creditCardSurchargeAmount}`
          );
        }
        if (
          printingData?.printingInvoiceDetailsResponseViewModels?.[0]
            ?.publicHolidaySurCharge != "0.00"
        ) {
          printer.println(
            `   Holiday Surcharge Amount:    $${printingData?.printingInvoiceDetailsResponseViewModels?.[0]?.publicHolidaySurCharge}`
          );
        }
        if (
          printingData?.printingInvoiceDetailsResponseViewModels?.[0]
            ?.discount !== "0.00"
        ) {
          printer.println(
            `   Discount Amount:    $${printingData?.printingInvoiceDetailsResponseViewModels?.[0]?.discount}`
          );
        }
        printer.println(`   Tax:    $${taxAmount}`);
        printer.println(`   Total:  $${totalPrice}`);

        printer.drawLine();
      }

      printer.println(`Thank you for your visit !`);

      // Print and disconnect the printer
      printer.cut();
      printer.execute();

      // printer.execute(function (err) {});
      // printer.print();
      // printer
      //   .execute(Buffer.from([0x1d, 0x56, 0x00]))
      //   .then(() => {
      //     console.log("Full cut executed");
      //   })
      //   .catch((error) => {
      //     console.error("Error occurred while executing full cut:", error);
      //   });
      // printer.raw(formattedOrder);
      // await printer.raw(formattedOrder);
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
