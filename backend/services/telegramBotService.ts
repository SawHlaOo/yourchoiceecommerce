import { Bot, type Context } from "node-telegram-bot-api";
import { productCardsService } from "./productCardsService.js";

const welcomeMessage = [
  "👋 Welcome to YourChoice!",
  "",
  "Thank you for contacting us. Please wait for our seller to reply to you.",
  "",
  "You can also ask about our products and prices.",
].join("\n");

const notFoundMessage =
  "Sorry, we couldn't find that product. Please try another product name, or wait for our seller to reply.";

const formatPrice = (price: number) =>
  `MMK ${price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const formatAvailability = (stock: number) =>
  stock > 0 ? `In stock (${stock})` : "Out of stock";

type Product = NonNullable<Awaited<ReturnType<typeof productCardsService.get>>>;

function formatProductDetails(product: Product) {
  return [
    `🛍️ Product: ${product.name}`,
    product.brand ? `🏷️ Brand: ${product.brand}` : undefined,
    `💰 Price: ${formatPrice(product.price)}`,
    `📦 Availability: ${formatAvailability(product.stock)}`,
    product.description ? `📝 Description: ${product.description}` : undefined,
  ].filter((line): line is string => Boolean(line)).join("\n");
}

async function replyWithPurchaseDetails(
  ctx: Context,
  bot: Bot,
  product: Product,
  adminChatId: string | undefined,
  customerMessage: string,
) {
  const customer = ctx.from;
  const customerName = customer
    ? [customer.first_name, customer.last_name].filter(Boolean).join(" ") || customer.username || "Unknown"
    : "Unknown";
  const availability = formatAvailability(product.stock);

  if (adminChatId && customer) {
    try {
      await bot.api.sendMessage({
        chat_id: adminChatId,
        text: [
          "🛒 New product inquiry",
          `👤 Customer Name: ${customerName}`,
          `🆔 Telegram User ID: ${customer.id}`,
          `🛒 Interested Product: ${product.name}`,
          `💰 Price: ${formatPrice(product.price)}`,
          `📦 Availability: ${availability}`,
          `💬 Customer Message: ${customerMessage}`,
        ].join("\n"),
      });
    } catch (error) {
      console.error("[telegram] failed to notify seller", error);
    }
  }

  const stockNote = product.stock > 0 ? "" : "\nThis product is currently out of stock; our seller can advise you.";
  await ctx.reply(
    `🛒 You are interested in buying:\n\n${formatProductDetails(product)}\n\nOur seller will contact you soon. Please wait. 😊${stockNote}`,
  );
}

function isGreeting(text: string) {
  return /^(?:hello|hi|hey|mingalabar|မင်္ဂလာပါ)[\s!,.?]*$/i.test(text);
}

function isPurchaseIntent(text: string) {
  return /\b(?:want to buy|would like to buy|interested in|looking to buy|buy|purchase)\b/i.test(text);
}

function extractProductQuery(text: string) {
  return text
    .replace(/^(?:i\s+)?(?:want\s+to\s+buy|would\s+like\s+to\s+buy|am\s+interested\s+in|i'?m\s+interested\s+in|looking\s+to\s+buy|looking\s+for|buy|purchase)\s+/i, "")
    .replace(/^(?:what(?:'s|\s+is)?\s+)?(?:the\s+)?price\s+of\s+/i, "")
    .replace(/^how\s+much\s+(?:is|are)\s+/i, "")
    .replace(/^how\s+much\s+does\s+/i, "")
    .replace(/\s+(?:price|cost)(?:\s+please)?[?.!]*$/i, "")
    .replace(/[?!.]+$/g, "")
    .trim();
}

export function startTelegramBot(): (() => Promise<void>) | undefined {
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  if (!token) return undefined;

  const adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID?.trim();
  if (!adminChatId) {
    console.warn("[telegram] TELEGRAM_ADMIN_CHAT_ID is not configured; seller notifications are disabled");
  }

  const bot = new Bot(token);
  bot.catch((error) => {
    console.error("[telegram] message handler failed", error);
  });

  bot.command("start", async (ctx) => {
    const payload = typeof ctx.match === "string" ? ctx.match.trim() : "";
    const productId = /^product_(\d+)$/.exec(payload)?.[1];
    if (!productId) {
      await ctx.reply(welcomeMessage);
      return;
    }

    const product = await productCardsService.get(Number(productId));
    if (!product || !product.isActive) {
      await ctx.reply("Sorry, this product is no longer available. Please ask us about another product.");
      return;
    }

    await replyWithPurchaseDetails(ctx, bot, product, adminChatId, `Buy now: ${product.name}`);
  });

  bot.on("message", async (ctx) => {
    const text = ctx.message?.text?.trim();
    if (!text || text.startsWith("/")) return;

    if (isGreeting(text)) {
      await ctx.reply(welcomeMessage);
      return;
    }

    const purchaseIntent = isPurchaseIntent(text);
    const query = extractProductQuery(text);
    if (!query) {
      await ctx.reply("Please send a product name or ask for its price. Our seller will reply as soon as possible.");
      return;
    }

    const products = await productCardsService.searchByName(query);
    if (products.length === 0) {
      await ctx.reply(notFoundMessage);
      return;
    }

    if (products.length > 1) {
      const productList = products
        .map((product) => `🛍️ ${product.name}\n💰 Price: ${formatPrice(product.price)}\n📦 Availability: ${formatAvailability(product.stock)}`)
        .join("\n\n");
      const response = purchaseIntent
        ? `I found a few matching products. Please send the exact product name so our seller knows which one you want:\n\n${productList}`
        : productList;
      await ctx.reply(response);
      return;
    }

    const product = products[0];
    if (!product) return;

    if (!purchaseIntent) {
      await ctx.reply(
        `🛍️ Product: ${product.name}\n💰 Price: ${formatPrice(product.price)}\n📦 Availability: ${formatAvailability(product.stock)}`,
      );
      return;
    }

    await replyWithPurchaseDetails(ctx, bot, product, adminChatId, text);
  });

  const polling = bot.startPolling().catch((error) => {
    console.error("[telegram] polling stopped unexpectedly", error);
  });

  return async () => {
    bot.stop();
    await polling;
    await bot.close();
  };
}
