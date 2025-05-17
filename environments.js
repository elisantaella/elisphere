// environments.js - Specialized environment creation for different strategy areas

class EnvironmentBuilder {
    constructor(game) {
      this.game = game;
    }
    
    // Base skybox creation
    createSkybox(color = 0x87ceeb) {
      const skyGeometry = new THREE.SphereGeometry(500, 32, 32);
      const skyMaterial = new THREE.MeshBasicMaterial({
        color: color,
        side: THREE.BackSide
      });
      const sky = new THREE.Mesh(skyGeometry, skyMaterial);
      this.game.scene.add(sky);
      
      return sky;
    }
    
    // Add clouds to the sky
    addClouds(count = 20) {
      for (let i = 0; i < count; i++) {
        const cloudGroup = new THREE.Group();
        
        const numPuffs = 3 + Math.floor(Math.random() * 5);
        for (let j = 0; j < numPuffs; j++) {
          const puffGeometry = new THREE.SphereGeometry(
            1 + Math.random() * 2,
            8,
            8
          );
          const puffMaterial = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.9
          });
          const puff = new THREE.Mesh(puffGeometry, puffMaterial);
          
          // Position puffs to create cloud shape
          puff.position.x = (Math.random() - 0.5) * 4;
          puff.position.y = (Math.random() - 0.5) * 1;
          puff.position.z = (Math.random() - 0.5) * 4;
          
          cloudGroup.add(puff);
        }
        
        // Position cloud in sky
        const angle = Math.random() * Math.PI * 2;
        const height = 20 + Math.random() * 30;
        const distance = 100 + Math.random() * 100;
        
        cloudGroup.position.set(
          Math.cos(angle) * distance,
          height,
          Math.sin(angle) * distance
        );
        
        this.game.scene.add(cloudGroup);
      }
    }
    
    // Add stars to the night sky
    addStars(count = 1000) {
      for (let i = 0; i < count; i++) {
        const starGeometry = new THREE.SphereGeometry(0.25, 4, 4);
        const starMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
        const star = new THREE.Mesh(starGeometry, starMaterial);
        
        // Random position in sphere
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(Math.random() * 2 - 1);
        const radius = 300 + Math.random() * 100;
        
        star.position.x = radius * Math.sin(phi) * Math.cos(theta);
        star.position.y = radius * Math.sin(phi) * Math.sin(theta);
        star.position.z = radius * Math.cos(phi);
        
        this.game.scene.add(star);
      }
    }
    
    // Create a tree
    createTree(x, z, height = 4, leafColor = 0x228b22) {
      // Tree trunk
      const trunkGeometry = new THREE.CylinderGeometry(0.5, 0.7, height, 8);
      const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
      const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
      trunk.position.set(x, height/2, z);
      trunk.castShadow = true;
      this.game.scene.add(trunk);
  
      // Tree leaves
      const leavesGeometry = new THREE.ConeGeometry(2, height + 1, 8);
      const leavesMaterial = new THREE.MeshStandardMaterial({ color: leafColor });
      const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
      leaves.position.set(x, height + 1, z);
      leaves.castShadow = true;
      this.game.scene.add(leaves);
      
      return { trunk, leaves };
    }
    
    // Create a bench
    createBench(x, z, angle) {
      // Bench seat
      const seatGeometry = new THREE.BoxGeometry(3, 0.2, 1);
      const seatMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
      const seat = new THREE.Mesh(seatGeometry, seatMaterial);
      seat.position.set(x, 0.6, z);
      seat.rotation.y = angle;
      seat.castShadow = true;
      this.game.scene.add(seat);
      
      // Bench legs
      for (let i = -1; i <= 1; i += 2) {
        const legGeometry = new THREE.BoxGeometry(0.2, 0.5, 1);
        const legMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
        const leg = new THREE.Mesh(legGeometry, legMaterial);
        leg.position.set(
          x + Math.cos(angle) * i,
          0.25,
          z + Math.sin(angle) * i
        );
        leg.rotation.y = angle;
        leg.castShadow = true;
        this.game.scene.add(leg);
      }
      
      // Bench back
      const backGeometry = new THREE.BoxGeometry(3, 1, 0.2);
      const backMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
      const back = new THREE.Mesh(backGeometry, backMaterial);
      back.position.set(
        x - Math.sin(angle) * 0.4,
        1.2,
        z + Math.cos(angle) * 0.4
      );
      back.rotation.y = angle;
      back.castShadow = true;
      this.game.scene.add(back);
      
      return { seat, back };
    }
    
    // Create a flower
    createFlower(x, z) {
      // Stem
      const stemGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.5, 8);
      const stemMaterial = new THREE.MeshStandardMaterial({ color: 0x228b22 });
      const stem = new THREE.Mesh(stemGeometry, stemMaterial);
      stem.position.set(x, 0.25, z);
      this.game.scene.add(stem);
      
      // Flower
      const petalGeometry = new THREE.SphereGeometry(0.15, 8, 8);
      const petalMaterial = new THREE.MeshStandardMaterial({ 
        color: this.getRandomFlowerColor() 
      });
      const flower = new THREE.Mesh(petalGeometry, petalMaterial);
      flower.position.set(x, 0.55, z);
      this.game.scene.add(flower);
      
      return { stem, flower };
    }
    
    // Helper to get random flower color
    getRandomFlowerColor() {
      const colors = [
        0xff0000, // Red
        0xffff00, // Yellow
        0xff69b4, // Pink
        0x800080, // Purple
        0xffa500, // Orange
        0x0000ff  // Blue
      ];
      return colors[Math.floor(Math.random() * colors.length)];
    }
    
    // Get random fall colors
    getRandomFallColor() {
      const fallColors = [
        0xFF8C00, // Dark Orange
        0xFF4500, // OrangeRed
        0xCD5C5C, // IndianRed
        0xA0522D, // Sienna
        0xD2691E, // Chocolate
        0xDEB887  // BurlyWood
      ];
      return fallColors[Math.floor(Math.random() * fallColors.length)];
    }
    
    // Get random food colors
    getRandomFoodColor() {
      const foodColors = [
        0xCD853F, // Pie
        0xD2B48C, // Bread
        0xF5DEB3, // Wheat (grain)
        0xDEB887, // Stew
        0x8B0000, // Jam
        0xFFD700  // Corn
      ];
      return foodColors[Math.floor(Math.random() * foodColors.length)];
    }
    
    // Get random dish colors for thanksgiving
    getRandomDishColor() {
      const dishColors = [
        0xF5DEB3, // Wheat (mashed potatoes)
        0xFFFFE0, // Light Yellow (corn)
        0x8FBC8F, // Dark Sea Green (green beans)
        0xDEB887, // Burlywood (stuffing)
        0xFF6347, // Tomato (cranberry sauce)
        0xB8860B  // Dark Goldenrod (gravy)
      ];
      return dishColors[Math.floor(Math.random() * dishColors.length)];
    }
    
    // Create Earth in the distance (for Goal Setting area)
    createEarth() {
      // Create Earth in the distance
      const earthGeometry = new THREE.SphereGeometry(30, 32, 32);
      const earthMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x0000FF, // Blue
        metalness: 0.1,
        roughness: 0.6
      });
      const earth = new THREE.Mesh(earthGeometry, earthMaterial);
      earth.position.set(0, 50, -350);
      this.game.scene.add(earth);
      
      // Add some cloud patterns
      const cloudGeometry = new THREE.SphereGeometry(31, 32, 32);
      const cloudMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xFFFFFF,
        transparent: true,
        opacity: 0.5,
        alphaMap: new THREE.DataTexture(
          this.generateCloudPattern(),
          64, 32,
          THREE.RGBAFormat
        )
      });
      const clouds = new THREE.Mesh(cloudGeometry, cloudMaterial);
      clouds.position.set(0, 50, -350);
      this.game.scene.add(clouds);
      
      return { earth, clouds };
    }
    
    // Generate a cloud pattern for Earth
    generateCloudPattern() {
      // Generate a simple procedural cloud pattern
      const size = 64 * 32;
      const data = new Uint8Array(4 * size);
      
      for (let i = 0; i < size; i++) {
        const stride = i * 4;
        const value = Math.random() > 0.8 ? 255 : 0;
        
        data[stride] = 255;
        data[stride + 1] = 255;
        data[stride + 2] = 255;
        data[stride + 3] = value;
      }
      
      return data;
    }
    
    // Create a moon crater
    createMoonCrater(x, z) {
      // Create a crater on the moon surface
      const size = 0.5 + Math.random() * 2;
      const craterGeometry = new THREE.CircleGeometry(size, 16);
      const craterMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xA0A0A0,
        roughness: 1,
        metalness: 0
      });
      const crater = new THREE.Mesh(craterGeometry, craterMaterial);
      crater.position.set(x, 0.02, z);
      crater.rotation.x = -Math.PI / 2;
      this.game.scene.add(crater);
      
      // Add a slight rim to the crater
      const rimGeometry = new THREE.RingGeometry(size, size + 0.2, 16);
      const rimMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xC8C8C8,
        roughness: 1,
        metalness: 0,
        side: THREE.DoubleSide
      });
      const rim = new THREE.Mesh(rimGeometry, rimMaterial);
      rim.position.set(x, 0.03, z);
      rim.rotation.x = -Math.PI / 2;
      this.game.scene.add(rim);
      
      return { crater, rim };
    }
    
    // Create a fall tree (for Gratitude area)
    createFallTree(x, z) {
      // Tree trunk
      const trunkGeometry = new THREE.CylinderGeometry(0.4, 0.5, 5, 8);
      const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
      const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
      trunk.position.set(x, 2.5, z);
      trunk.castShadow = true;
      this.game.scene.add(trunk);
      
      // Tree leaves - fall colors
      const leavesGeometry = new THREE.SphereGeometry(2, 8, 8);
      const leavesMaterial = new THREE.MeshStandardMaterial({ 
        color: this.getRandomFallColor() 
      });
      const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
      leaves.position.set(x, 6, z);
      leaves.castShadow = true;
      this.game.scene.add(leaves);
      
      return { trunk, leaves };
    }
    
    // Create a thanksgiving table for Gratitude area
    createThanksgivingTable() {
      // Table
      const tableGeometry = new THREE.BoxGeometry(6, 0.2, 3);
      const tableMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
      const table = new THREE.Mesh(tableGeometry, tableMaterial);
      table.position.y = 0.8;
      table.castShadow = true;
      table.receiveShadow = true;
      this.game.scene.add(table);
      
      // Table legs
      for (let x = -2.5; x <= 2.5; x += 5) {
        for (let z = -1.25; z <= 1.25; z += 2.5) {
          const legGeometry = new THREE.BoxGeometry(0.2, 0.8, 0.2);
          const legMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
          const leg = new THREE.Mesh(legGeometry, legMaterial);
          leg.position.set(x, 0.4, z);
          leg.castShadow = true;
          this.game.scene.add(leg);
        }
      }
      
      // Add a turkey centerpiece
      const turkeyBodyGeometry = new THREE.SphereGeometry(0.5, 16, 16);
      const turkeyMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
      const turkeyBody = new THREE.Mesh(turkeyBodyGeometry, turkeyMaterial);
      turkeyBody.position.set(0, 1.2, 0);
      turkeyBody.castShadow = true;
      this.game.scene.add(turkeyBody);
      
      // Turkey plate
      const plateGeometry = new THREE.CylinderGeometry(0.8, 0.8, 0.1, 32);
      const plateMaterial = new THREE.MeshStandardMaterial({ color: 0xF5F5F5 });
      const plate = new THREE.Mesh(plateGeometry, plateMaterial);
      plate.position.set(0, 0.95, 0);
      plate.castShadow = true;
      this.game.scene.add(plate);
      
      // Add some dishes
      const dishPositions = [
        { x: -2, z: 0 },
        { x: 2, z: 0 },
        { x: -1, z: 1 },
        { x: 1, z: 1 },
        { x: -1, z: -1 },
        { x: 1, z: -1 }
      ];
      
      for (let pos of dishPositions) {
        const dishGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.15, 16);
        const dishMaterial = new THREE.MeshStandardMaterial({ 
          color: this.getRandomDishColor() 
        });
        const dish = new THREE.Mesh(dishGeometry, dishMaterial);
        dish.position.set(pos.x, 1, pos.z);
        dish.castShadow = true;
        this.game.scene.add(dish);
      }
      
      // Add a gratitude journal on the table
      const journalGeometry = new THREE.BoxGeometry(0.5, 0.1, 0.7);
      const journalMaterial = new THREE.MeshStandardMaterial({ color: 0xA0522D });
      const journal = new THREE.Mesh(journalGeometry, journalMaterial);
      journal.position.set(-1.5, 1, -0.5);
      journal.rotation.y = 0.3;
      journal.castShadow = true;
      this.game.scene.add(journal);
      
      // Journal text
      if (this.game.assetsLoaded && this.game.assets.fonts.default) {
        const font = this.game.assets.fonts.default;
        const textGeometry = new THREE.TextGeometry('Gratitude\nJournal', {
          font: font,
          size: 0.1,
          height: 0.02,
          curveSegments: 4,
          bevelEnabled: false
        });
        
        const textMaterial = new THREE.MeshStandardMaterial({ color: 0xFFD700 });
        const textMesh = new THREE.Mesh(textGeometry, textMaterial);
        textMesh.position.set(-1.7, 1.1, -0.7);
        textMesh.rotation.x = -Math.PI / 2;
        textMesh.rotation.z = 0.3;
        this.game.scene.add(textMesh);
      }
      
      return { table, turkeyBody, journal };
    }
    createSkybox(color = 0x87ceeb) {
      if (this.game.assetsLoaded && this.game.assets.textures.sky) {
        const skyGeometry = new THREE.SphereGeometry(500, 32, 32);
        const skyMaterial = new THREE.MeshBasicMaterial({
          map: this.game.assets.textures.sky,
          side: THREE.BackSide
        });
        const sky = new THREE.Mesh(skyGeometry, skyMaterial);
        this.game.scene.add(sky);
        
        return sky;
      } else {
        // Fallback to the original color-based skybox
        const skyGeometry = new THREE.SphereGeometry(500, 32, 32);
        const skyMaterial = new THREE.MeshBasicMaterial({
          color: color,
          side: THREE.BackSide
        });
        const sky = new THREE.Mesh(skyGeometry, skyMaterial);
        this.game.scene.add(sky);
        
        return sky;
      }
    }
    // Create a flag (for Goal Setting area)
    createFlag() {
      // Flag pole
      const poleGeometry = new THREE.CylinderGeometry(0.05, 0.05, 4, 8);
      const poleMaterial = new THREE.MeshStandardMaterial({ color: 0xC0C0C0 });
      const pole = new THREE.Mesh(poleGeometry, poleMaterial);
      pole.position.set(0, 2, 10);
      pole.castShadow = true;
      this.game.scene.add(pole);
      
      // Flag
      const flagGeometry = new THREE.PlaneGeometry(3, 2);
      const flagMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xFF0000,
        side: THREE.DoubleSide
      });
      const flag = new THREE.Mesh(flagGeometry, flagMaterial);
      flag.position.set(1.5, 3, 10);
      flag.castShadow = true;
      this.game.scene.add(flag);
      
      // Flag texture - will use a simple pattern for now
      const starGeometry = new THREE.CircleGeometry(0.2, 5);
      const starMaterial = new THREE.MeshStandardMaterial({ color: 0xFFFFFF });
      
      for (let i = 0; i < 5; i++) {
        for (let j = 0; j < 6; j++) {
          const star = new THREE.Mesh(starGeometry, starMaterial);
          star.position.set(
            0.5 + j * 0.4,
            3.5 - i * 0.4,
            10.01
          );
          star.rotation.z = Math.random() * Math.PI;
          this.game.scene.add(star);
        }
      }
      
      return { pole, flag };
    }
    
    // Create a lunar module (for Goal Setting area)
    createLunarModule() {
      // Base
      const baseGeometry = new THREE.CylinderGeometry(3, 4, 1, 8);
      const baseMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xC0C0C0,
        metalness: 0.8,
        roughness: 0.2
      });
      const base = new THREE.Mesh(baseGeometry, baseMaterial);
      base.position.set(0, 0.5, 0);
      base.castShadow = true;
      this.game.scene.add(base);
      
      // Upper module
      const upperGeometry = new THREE.CylinderGeometry(2, 2.5, 2, 8);
      const upperMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xC0C0C0,
        metalness: 0.8,
        roughness: 0.2  
      });
      const upper = new THREE.Mesh(upperGeometry, upperMaterial);
      upper.position.set(0, 2, 0);
      upper.castShadow = true;
      this.game.scene.add(upper);
      
      // Landing legs
      for (let i = 0; i < 4; i++) {
        const angle = (i / 4) * Math.PI * 2;
        
        // Leg structure
        const legGeometry = new THREE.BoxGeometry(0.2, 3, 0.2);
        const legMaterial = new THREE.MeshStandardMaterial({ color: 0x505050 });
        const leg = new THREE.Mesh(legGeometry, legMaterial);
        
        // Position at angle from center
        leg.position.set(
          Math.cos(angle) * 3,
          0,
          Math.sin(angle) * 3
        );
        
        // Rotate to point outward
        leg.rotation.z = Math.cos(angle) * 0.5;
        leg.rotation.x = Math.sin(angle) * 0.5;
        
        leg.castShadow = true;
        this.game.scene.add(leg);
        
        // Foot pad
        const footGeometry = new THREE.CylinderGeometry(0.5, 1, 0.2, 8);
        const footMaterial = new THREE.MeshStandardMaterial({ color: 0x505050 });
        const foot = new THREE.Mesh(footGeometry, footMaterial);
        
        foot.position.set(
          Math.cos(angle) * 4,
          -1.4,
          Math.sin(angle) * 4
        );
        
        foot.castShadow = true;
        foot.receiveShadow = true;
        this.game.scene.add(foot);
      }
      
      // Antenna
      const antennaGeometry = new THREE.CylinderGeometry(0.05, 0.05, 2, 8);
      const antennaMaterial = new THREE.MeshStandardMaterial({ color: 0x505050 });
      const antenna = new THREE.Mesh(antennaGeometry, antennaMaterial);
      antenna.position.set(0, 4, 0);
      antenna.castShadow = true;
      this.game.scene.add(antenna);
      
      // Antenna dish
      const dishGeometry = new THREE.SphereGeometry(0.3, 8, 8, 0, Math.PI);
      const dishMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xFFFFFF,
        side: THREE.DoubleSide
      });
      const dish = new THREE.Mesh(dishGeometry, dishMaterial);
      dish.position.set(0, 5, 0);
      dish.rotation.x = Math.PI / 2;
      dish.castShadow = true;
      this.game.scene.add(dish);
      
      // Window
      const windowGeometry = new THREE.CircleGeometry(0.5, 16);
      const windowMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x87CEEB,
        transparent: true,
        opacity: 0.7
      });
      const window1 = new THREE.Mesh(windowGeometry, windowMaterial);
      window1.position.set(0, 2, 2.01);
      this.game.scene.add(window1);
      
      return { base, upper, antenna, dish };
    }
  }
  
  // Export for module use
  if (typeof module !== 'undefined') {
    module.exports = {
      EnvironmentBuilder
    };
  } else {
    // For browser use, add to window
    window.EnvironmentBuilder = EnvironmentBuilder;
  }