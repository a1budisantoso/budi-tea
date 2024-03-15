// Mengimpor library fs untuk membaca file
const fs = require("fs");

// Mengimpor library near-api-js
const nearAPI = require("near-api-js");
// Mengimpor fungsi dan objek yang diperlukan dari near-api-js
const { connect, KeyPair, keyStores, utils } = nearAPI;

// Konfigurasi akun pengirim, id jaringan, jumlah NEAR yang akan dikirim, dan kunci privat
const sender =
  "looseroom.testnet"; // Ganti alamat Pengirim
const networkId = "testnet";
const amount = utils.format.parseNearAmount("0.001"); // Jumlah token NEAR yang dikirim
const nodeUrl =
  "https://near-testnet.lava.build/lava-referer-7a310bfe-ce24-4380-9df0-4aa1a19972d0/";

// Fungsi untuk membaca privateKey dari file privatekey.txt
function readPrivateKey() {
  try {
    return fs.readFileSync("privatekey.txt", "utf8").trim();
  } catch (error) {
    console.error("Gagal membaca file privatekey.txt:", error);
    return null;
  }
}

// Fungsi untuk mengirim transaksi ke alamat penerima tertentu
async function sendTransaction(receiver) {
  // Mendapatkan privateKey dari file
  const privateKey = readPrivateKey();
  if (!privateKey) return;

  // Membuat objek keyStore kosong di dalam memori menggunakan near-api-js
  const keyStore = new keyStores.InMemoryKeyStore();
  // Membuat keyPair dari kunci privat yang telah disediakan
  const keyPair = KeyPair.fromString(privateKey);
  // Menambahkan key yang baru dibuat ke dalam keyStore yang dapat menampung beberapa key
  await keyStore.setKey(networkId, sender, keyPair);

  // Konfigurasi yang digunakan untuk terhubung ke NEAR
  const config = {
    networkId,
    keyStore,
    nodeUrl,
    walletUrl: "https://testnet.mynearwallet.com/",
    helperUrl: "https://helper.testnet.near.org",
    explorerUrl: "https://testnet.nearblocks.io",
  };

  // Terhubung ke NEAR
  const near = await connect(config);
  // Membuat objek akun NEAR
  const senderAccount = await near.account(sender);

  try {
    // Menggunakan utilitas near-api-js untuk mengonversi yoctoNEAR kembali menjadi floating point
    console.log(`Mengirim ${utils.format.formatNearAmount(amount)} $NEAR`);
    console.log(``);
    console.log(`dari ${sender}`);
    console.log(`ke ${receiver}`);
    // Mengirim token tersebut
    const result = await senderAccount.sendMoney(receiver, amount);
    // Menampilkan hasil transaksi
    console.log(``);
    console.log("Hasil Transaksi: ", result.transaction);
    console.log(``);
    // Menampilkan tautan ke NEAR Explorer untuk melihat transaksi
    console.log("TX HASH");
    console.log(`${config.explorerUrl}/txns/${result.transaction.hash}`);
    console.log(``);
  } catch (error) {
    // Mengembalikan error jika tidak berhasil
    console.error(error);
  }
}

// Fungsi untuk mengulangi pengiriman transaksi tanpa batas ke semua alamat penerima dalam file receivers.txt
async function repeatTransactions() {
  while (true) {
    try {
      // Baca file receivers.txt untuk mendapatkan daftar alamat penerima
      const receivers = fs.readFileSync("receivers.txt", "utf8").split("\n");
      for (const receiver of receivers) {
        // Jika receiver tidak kosong, kirim transaksi ke receiver
        if (receiver.trim() !== "") {
          await sendTransaction(receiver.trim());
          const randomTime = getRandomTime();
          console.log("Jeda", randomTime, "detik...");
          console.log(``);
          console.log("----------------------------------------------------");
          console.log(``);
          await new Promise((resolve) =>
            setTimeout(resolve, randomTime * 1000),
          ); // Penundaan waktu acak
        }
      }
    } catch (error) {
      console.error("Gagal membaca file receivers.txt:", error);
    }
  }
}

// Fungsi untuk mendapatkan waktu acak dalam detik
function getRandomTime() {
  const randomSeconds = Math.floor(Math.random() * 50); // Mendapatkan nomor acak antara 0 dan 49
  const startTime = 10; // Waktu mulai dalam detik
  const randomTime = startTime + randomSeconds; // Menambahkan nomor acak ke waktu mulai
  return randomTime;
}

// Menjalankan fungsi untuk mengulangi transaksi tanpa batas
repeatTransactions();
